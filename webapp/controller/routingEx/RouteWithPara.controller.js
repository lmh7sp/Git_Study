sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";
	return BaseController.extend("sap.ui.study.git.controller.routingEx.RouteWithPara", {
		onInit: function () {

		},
		onItemPress: function(event){
			var oItem = event.getParameters().listItem;
			var oENum = oItem.getParent().indexOfItem(oItem);
			this.getRouter().navTo("routePara", {
				employeeNum : oENum
			});
		}
	});

});