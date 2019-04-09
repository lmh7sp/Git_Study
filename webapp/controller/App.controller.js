sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.App", {

		onInit: function () {

		},
		onPressMenu: function(){
			var oContainer = this.byId("container"),
				vMode = oContainer.getMode(),
				oCurrentDetail = oContainer.getCurrentDetailPage();
			if(oCurrentDetail && oCurrentDetail.getControllerName() != "sap.ui.study.git.controller.HomePage" ){
				if(vMode == "HideMode"){
					oContainer.setMode("StretchCompressMode");
				} else if(vMode =="StretchCompressMode"){
					oContainer.setMode("HideMode");
				}
			}
		},
		onSelectTab: function (event) {
			var oContainer = this.byId("container"),
				oTab = event.getParameter('item');
			if(oTab.getKey()){
				this.getRouter().navTo(oTab.getKey());
				if(oTab.getKey() =="homePage")
					oContainer.setMode("HideMode");
			}
			
		}

	});

});

