sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent"
], function(Controller, History, UIComponent) {
	"use strict";

	return Controller.extend("sap.ui.study.git.controller.BaseController", {

		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("home", {}, true /*no history*/);
			}
		},

		onPressHome: function () {
			var oIconTabHeader = this.byId('iconTabHeader');
			oIconTabHeader.setSelectedKey('invalidKey');
			this.getRouter().navTo("home", {}, true );
		},
		onSelectTab: function (event) {
			var oTab = event.getParameter('item');
			if(oTab.getKey() == "10"){
				this.getRouter().navTo("sampleMenu");
			} else if(oTab.getKey() == "20"){
				
			}
		}

	});

});