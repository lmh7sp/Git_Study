sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.DetailHeader", {

		onInit: function () {
			
		},
		goCode: function(){
			var oPage = this.getView().byId("navContainer").getCurrentPage(); 
			var sControllerName = oPage.getControllerName();
			var sName = sControllerName.split(".").pop();
			if(sName === "TableCodeEditor"){
				this.getRouter().navTo("tableExample");
			} else if(sName ==="TableExample"){
				this.getRouter().navTo("tableCodeEditor");
			}
		}

	});

});

