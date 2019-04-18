sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";


	return BaseController.extend("sap.ui.study.git.controller.CodeEditor", {

		onInit: function () {
			var oRouter, oTarget;
			oRouter = this.getRouter();
			oTarget = oRouter.getTarget("codeEditor");
			oTarget.attachDisplay(function(oEvent){
				this._Data = oEvent.getParameter("data");
			},this);
			this._Editor = this.byId("codeEditor");
			this._Editor.setValue('// select tabs to see value of CodeEditor changing');
			
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function(evt){this.putCodes(evt);},this)
			});

		},
		putCodes: function(){
			var oIconTabHeader = this.getView().byId("iconTabHeader"),
				oModel = this.getOwnerComponent().getModel("codeModel"),
				aView = null, aController = null,sView = null, sController = null, i ;
			if(this._Data && this._Data.prevPageName){
				if(oModel){
					aView = oModel.getData()[this._Data.prevPageName].view;
					aController = oModel.getData()[this._Data.prevPageName].controller;
					if(aView.length){
						for(i in aView){
							sView = i == 0 ? aView[i] :	sView + aView[i];
						}
					} else {sView = "<!--no data for View-->";}
					i = null;
					if(aController.length){
						for(i in aController){
							sController = i == 0 ? aController[i] :	sController + aController[i];
						}
					} else {sController = "//no data for Controller";}
				} else {
					sView = "<!--no Models-->";
					sController = "//no Models";
				}
			} else{
				sView = "<!--you came from wrong path-->";
				sController = "//you came from wrong path";
			}
			this._View = sView;
			this._Controller = sController;
			
			this._Editor.setValue(this._View);
			this._Editor.setType("xml");
			this._Editor.prettyPrint();
			oIconTabHeader.setSelectedKey("A");
		},
		onSelectCode: function (oEvent) {
			var sFilterId = oEvent.getParameter("selectedKey");

			switch (sFilterId) {
				case "A":
					this._Editor.setValue(this._View);
					this._Editor.setType("xml");
					this._Editor.prettyPrint();
					break;
				case "B":
					this._Editor.setValue(this._Controller);
					this._Editor.setType("javascript");
					this._Editor.prettyPrint();
					break;
			}
		}

	});

});

