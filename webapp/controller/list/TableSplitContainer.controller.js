sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.list.TableSplitContainer", {
		onInit: function () {

		},
		onPressTableExample : function () {
			var oView = sap.ui.getCore().byId("container-nav---tableSplitContainer");
			var oApp = sap.ui.getCore().byId(oView.createId("tableSplit"));
			if(!oApp.getDetailPage("sap.ui.study.git.view.list.TableExample")) oApp.addDetailPage(sap.ui.xmlview("sap.ui.study.git.view.list.TableExample","sap.ui.study.git.view.list.TableExample"));    
			oApp.toDetail("sap.ui.study.git.view.list.TableExample","show");
		},
		onPressListExample : function () {
			var oView = sap.ui.getCore().byId("container-nav---tableSplitContainer");
			var oApp = sap.ui.getCore().byId(oView.createId("tableSplit"));
			if(!oApp.getDetailPage("sap.ui.study.git.view.list.ListExample")) oApp.addDetailPage(sap.ui.xmlview("sap.ui.study.git.view.list.ListExample","sap.ui.study.git.view.list.ListExample"));    
			oApp.toDetail("sap.ui.study.git.view.list.ListExample","show");
		},
	});

});