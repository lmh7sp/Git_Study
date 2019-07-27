sap.ui.define([
	"sap/ui/study/git/controller/BaseController",
	"sap/ui/core/routing/HashChanger"
], function (BaseController, HashChanger) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.DetailHeader", {

		onInit: function () {

			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function(evt){this.beforeShow(evt);},this)
			});
		},
		beforeShow: function(){
			alert("oh,my");	
		},
		goCode: function(){
			var oPage = this.getView().byId("navContainer").getCurrentPage(); 
			var sName = oPage.getControllerName().split(".").pop();
			var oHash =  HashChanger.getInstance();
			if(sName === "CodeEditor"){
				// this.getRouter().navTo("tableExample");
				oHash.fireHashChanged(oHash.getHash(),oHash.getHash());
			} else {
				this.getRouter().getTarget("codeEditor").display({
					prevPageName: sName
				});
			}
		}
		
	// var oHistory, sPreviousHash;

	// 		oHistory = History.getInstance();
	// 		sPreviousHash = oHistory.getCurrentHash();

	// 		if (sPreviousHash !== undefined) {
	// 			window.history.go(-1);
	// 		} else {
	// 			this.getRouter().navTo("appHome", {}, true /*no history*/);
	// 		}
	});

});

