sap.ui.define([
	"sap/ui/study/git/controller/BaseController",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/study/git/Component"
], function (BaseController, HashChanger) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.App", {

		onInit: function () {
			var oRouter = this.getRouter();
			var oTitle = this.getView().byId("title");
			this._messageValue = "First Match";
			oRouter.attachBeforeRouteMatched(this._onRouteBeforeMatched, this);
			oRouter.attachRouteMatched(this._onRouteMatched, this);
			
			oRouter.attachTitleChanged(function(oEvent) {
			    var sTitle = oEvent.getParameter("title");
			    //this = router
			    document.title = sTitle;
			    oTitle.setText(sTitle);
			});
			this.modelSetting();
		},
		_onRouteBeforeMatched: function(event){
			if(event.getParameters().name === "routingEvent"){
				// this._messageValue = "onBeforeMatched to all";
			}
		},
		_onRouteMatched: function(event){
			if(event.getParameters().name === "routingEvent"){
				// sap.m.MessageToast.show(this._messageValue);
			}
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
			
		},
		modelSetting: function(){
			// var sModelUrl = "https://" + "hanamdcp2000580973trial.hanatrial.ondemand.com/App_OData/OData/company.xsodata/";
			// var myOData = new sap.ui.model.odata.v2.ODataModel({
			// 	serviceUrl:sModelUrl,
			// 	user:"SYSTEM",
			// 	password:"!Q2w3e4r5t6y7u8i9o0p",
			// 	useBatch:false
			// });
			// try{
			// 	myOData.read("/Employees",{
			// 		success: function(oData, response){
			// 			console.log("oData > ", oData)
			// 		},
			// 		error: function(oError){
			// 			console.log("Error > ", oError)
			// 		}
			// 	});
			// }catch(e){
				
			// }
		}

	});

});

