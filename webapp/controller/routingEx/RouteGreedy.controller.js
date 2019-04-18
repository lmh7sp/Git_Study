sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";
	return BaseController.extend("sap.ui.study.git.controller.routingEx.RouteGreedy", {
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("routeGreedy").attachMatched(this._onMatched, this);
		},
		onPressHashChange: function(event){
			var oInput = this.getView().byId("myInput");
			var sName = oInput.getValue();
			this.getRouter().navTo("routeGreedy", {
				"detail*" : sName
			});
		},
		_onMatched:function(oEvent){
			var oArgs = oEvent.getParameter("arguments");
			var oText = this.getView().byId("myText");
			oText.setText("Current Hash Value : " + oArgs["detail*"]);
		}
	});

});