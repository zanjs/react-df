/**
 * 地图模块(使用腾讯地图)
 * @module TencentMap
 * @example
 * var markers =  [{x:116,y:30,description:'This is a description'},{x:117,y:31,description:'This is a description'}] <br/>
 * <TencentMap id="map1" mapData={markers} height={"300px"} width={"300px"} zoom={13} centerPoint={{x:116.397128,y:39.916527}}></TencentMap>
 * 
 */
var React = require('react');
var $ = require('jQuery');

/**
 * 地图基础类
 * @class TencentMap
 * @constructor
 * @param {String} id 组件id
 * @param {String} height 高度 默认300px
 * @param {String} width  宽度 默认100%
 * @param {int} zoom  放大倍数，默认为7
 * @param {Object} centerPoint  传入初始化地图中心点位置 x:经度,y:维度 eg:centerPoint={{x:116.397128,y:39.916527}} 默认中心点为北京天安门
 * @param {Object} mapData 传入初始化位置标签 x:经度,y:维度,description:描述 eg:[{x:116,y:30,description:'This is a description'},{x:117,y:31,description:'This is a description'}]
 * 
 */
var TencentMap = React.createClass({

	statics:{
		//保存地图表本身
		map:[],
		//保存地图组件引用
		mapComponentRefs:[],
		//是否已加载地图的脚本文件
		loadMapScriptFlag:false,
		//lock用于并发加载（就是同时加载多个map脚本）时提供代码块锁定功能
		lock:false,

	},

	getInitialState: function() {
		return {
			//保存地图坐标数据
			mapData:[],
			//地图是否已经加载完毕
			mapReady:false,
			mapHeight:"300px",
			mapWidth:"100%",
			zoom:7
		};
	},

	
	/**
	 * 初始化地图,初始化中心点为北京天安门
	 * @private
	 * @method initTencentMap
	 */
 	initTencentMap : function() {
	    
	    var centerPoint;
	    if(this.props.centerPoint){
	    	//设置中心点
	    	centerPoint = new qq.maps.LatLng(this.props.centerPoint.y,this.props.centerPoint.x);
	    }else{
	    	//默认中心点
	    	centerPoint = new qq.maps.LatLng(39.916527,116.397128);
	    }
	    //设置放大倍数
	    var zoom = this.props.zoom||this.state.zoom;

	    var options = {
	    	zoom: zoom,
	    	center: centerPoint,
	    	mapTypeId: qq.maps.MapTypeId.ROADMAP
	    };

	  	TencentMap.map[this.props.id] = new qq.maps.Map(document.getElementById("tencentMapDiv"+this.props.id), options);

	},

	/**
	 * 设置一组坐标点标签
	 * @private
	 * @method setNewMarks
	 * @param {Array} markers 传入坐标标签数组 x:经度,y:维度,description:描述 eg:[{x:116,y:30,description:'This is a description'},{x:117,y:31,description:'This is a description'}]
	 */
	setNewMarks : function(markers){
		var self = this;
		markers.map(function(marker) {
			self.setNewMark(marker);
		})
	},


	/**
	 * 设置坐标点标签
	 * @private
	 * @method setNewMark
	 * @param {Object} markers 传入坐标标签数组 x:经度,y:维度,description:描述 eg:{x:116,y:30,description:'This is a description'}
	 */
	setNewMark : function(marker){

  		var positionPoint=new qq.maps.LatLng(marker.y,marker.x);

	    var _marker = new qq.maps.Marker({
	        position: positionPoint,
	        map: TencentMap.map[this.props.id]
	    });

	    if(marker.description){

	    	var infoWin = new qq.maps.InfoWindow({
	        map: TencentMap.map[this.props.id]
		    });

		    qq.maps.event.addListener(_marker, 'click', function() {
	            infoWin.open();
	            infoWin.setContent(marker.description);
	            infoWin.setPosition(positionPoint);
	        });
	    }

	   

	},
	 /**
	  * 加载地图脚本
	  * @private
	  * @method loadMapScript
	  */
	loadMapScript : function() {

	 	if(!TencentMap.lock){
	 		TencentMap.lock = true;

	 		/**
	 		 * window全局方法,在地图脚本加载完后回调，同时定义2个全局方法方便设置坐标点
	 		 * @for window
	 		 * @method loadMapScriptCallBack
	 		 */
	 		window.loadMapScriptCallBack=function(){

	 			/**
	 			 * window全局方法,设置新的位置标记
	 			 * @for window
	 			 * @method setNewMark
	 			 * @param {String} mapId  地图控件的ID
	 			 * @param {Object} marker 要标记的位置对象 x:经度,y:维度,description:描述 eg:{x:116,y:30,description:'This is a description'}
	 			 */
				window.setNewMark = function(mapId,marker){

			  		var positionPoint=new qq.maps.LatLng(marker.y,marker.x);

				    var _marker = new qq.maps.Marker({
				        position: positionPoint,
				        map: TencentMap.map[mapId]
				    });

				    if(marker.description){

				    	var infoWin = new qq.maps.InfoWindow({
				        	map: TencentMap.map[mapId]
					    });

					    qq.maps.event.addListener(_marker, 'click', function() {
				            infoWin.open();
				            infoWin.setContent(marker.description);
				            infoWin.setPosition(positionPoint);
				        });
				    }

				},

				/**
				 * window全局方法,设置一组新的位置标记
				 * @for window
				 * @method setNewMarks
				 * @param {String} mapId   地图控件的ID
				 * @param {Array} markers 要标记的位置对象数组 x:经度,y:维度,description:描述 eg:[{x:116,y:30,description:'This is a description'},{x:117,y:31,description:'This is a description'}]
				 */
				window.setNewMarks = function(mapId,markers){
					markers.map(function(marker) {
						setNewMark(mapId,marker);
					})
				},

				//如果脚本已加载，则刷新全部地图组件
				TencentMap.loadMapScriptFlag = true;
				TencentMap.mapComponentRefs.map(function(mapRef) {
					mapRef.setState({
						mapReady:true
					});
				})
			}

			
		  	var script = document.createElement("script");
		  	script.type = "text/javascript";
		  	script.src = "http://map.qq.com/api/js?v=2.exp&callback=window.loadMapScriptCallBack";
		  	document.body.appendChild(script);
	 	}

	 	//脚本已加载，直接刷新组件
	 	if(TencentMap.loadMapScriptFlag){
	 		this.setState({
	 			mapReady:true
	 		});
	 	}
		

	},

	//清除地图上的全部坐标点
	clearAllMarks: function(){
		//清除位置标记
		var markersArray = this.state.mapData;
		if (markersArray) {
	        for (i in markersArray) {
	            markersArray[i].setMap(null);
	        }
    	}
	},

	componentWillMount: function() {
		
		if(this.props.height){
			this.state.mapHeight = this.props.height;
		}

		if(this.props.width){
			this.state.mapWidth = this.props.width;
		}
	},
	
	componentDidMount: function() {
		//加载脚本
		this.loadMapScript();
		//把当前组件引用添加到全局数组中，以便加载完脚本可以刷新
		TencentMap.mapComponentRefs.push(this);
	},

	componentWillUpdate: function(nextProps, nextState) {

		//初始化地图，这一步在加载完脚本后才执行
		this.initTencentMap();
	},


	render: function() {
		//判断地图是否已经加载成功，如果成功，则初始化地图坐标
		if(this.state.mapReady){
			//清楚地图上的坐标点
			this.clearAllMarks();
			//保存坐标点
			this.state.mapData = this.props.mapData;
			//设置坐标点
			this.setNewMarks(this.props.mapData);
		}
		return (<div>
				<div className={this.props.cssClass} id={"tencentMapDiv"+this.props.id} style={{"height":this.state.mapHeight,"width":this.state.mapWidth}}>
				</div>
			</div>);
	}

});

module.exports = TencentMap;