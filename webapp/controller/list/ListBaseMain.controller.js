sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.list.ListBaseMain", {
		_Controller : null,
		onInit: function () {
			this._Controller = this;
		},
		onExample : function (event) {
			var oView = this._Controller.getView();
			var oContainer = sap.ui.getCore().byId(oView.createId("Container"));
			var oBtn = event.getParameters().item;
			if(oBtn && oBtn.getKey() != ""){
				if(!oContainer.getPage("sap.ui.study.git.view.list." + oBtn.getKey())) {
					oContainer.addPage(sap.ui.xmlview("sap.ui.study.git.view.list." + oBtn.getKey(),"sap.ui.study.git.view.list." + oBtn.getKey()));
				}
				oContainer.to("sap.ui.study.git.view.list." + oBtn.getKey(),"show");
			}
		}
	});

});