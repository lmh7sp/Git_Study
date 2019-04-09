sap.ui.define([
	"sap/ui/study/git/controller/BaseController",
	"sap/ui/model/Filter"
], function (BaseController,Filter) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.StudyMenu", {
		onPressTreeItem: function(event){
			var oBtn = event.getParameters().listItem.getCustomData()[0];
			if(oBtn && oBtn.getKey() == "goTo")
				this.getRouter().navTo(oBtn.getValue());
		},
		onSearch: function(event){
			var aFilters = [],
				sQuery = event.getSource().getValue(), 
				oFilter,
				oTree = this.byId("tree"),
				oBinding;
			if (sQuery && sQuery.length > 0) {
				oFilter = new Filter("text", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(oFilter);
			}

			oBinding = oTree.getBinding("items");
			oBinding.filter(aFilters, "Application");
		}

	});

});
