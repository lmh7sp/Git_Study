sap.ui.define([
	"sap/ui/study/git/controller/BaseController",
	"sap/m/MessageToast"
], function (BaseController, MessageToast) {
	"use strict";
	return BaseController.extend("sap.ui.study.git.controller.routingEx.RouteGreedEvent", {
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("routeGreedEvent").attachMatched(this._onMatched, this);
		},
		_onMatched:function(oEvent){
			MessageToast.show("Hash Matched for greedy", {duration: 9000});
			this.getRouter().myNavBack("routeGreedy");
		}
	});

});