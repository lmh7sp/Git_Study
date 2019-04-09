sap.ui.define([
	"sap/ui/study/git/controller/BaseController",
	"sap/ui/model/Filter"
], function (BaseController,Filter) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.list.TableExample", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sap.ui.study.git.table.view.Table_example
		 */
		onInit: function () {

		},
		onSearch: function(event){
			var aFilters = [],
				sQuery = event.getSource().getValue(),
				sPath = event.getSource().getCustomData()[0].getValue(),
				oFilter,
				oTable = this.byId("tableExample"),
				oBinding;
			if (sQuery && sQuery.length > 0) {
				oFilter = new Filter(sPath, sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(oFilter);
			}

			oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters, "Application");
		}
	});

});