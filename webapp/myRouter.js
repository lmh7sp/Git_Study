sap.ui.define([
	"sap/ui/core/routing/Router",
	"sap/m/routing/RouteMatchedHandler",
	"sap/ui/core/routing/History"
], function (Router, RouteMatchedHandler,History) {
	"use strict";

	return Router.extend("sap.ui.study.git.myRouter", {

		constructor : function() {
			sap.ui.core.routing.Router.apply(this, arguments);
			this._oRouteMatchedHandler = new RouteMatchedHandler(this);
			this.routeInfo = sap.ui.getCore().getModel("routeModel").getData();
			this.targetInfo = sap.ui.getCore().getModel("targetModel").getData();
				
			var i;
			for(i in this.targetInfo){
				this.getTargets().addTarget(i,this.targetInfo[i]);
			}
			i=null;
			for(i in this.routeInfo){
				this.addRoute(this.routeInfo[i]);
			}
		},
	
		myNavBack : function(sRoute, mData) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
	
			// The history contains a previous entry
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var bReplace = true; // otherwise we go backwards with a forward history
				this.navTo(sRoute, mData, bReplace);
			}
		}
	});

});
