sap.ui.define([
	"sap/ui/study/git/controller/BaseController",
	"sap/ui/model/Filter"
], function (BaseController,Filter) { 
	"use strict";
	var _Filter = [];	
	return BaseController.extend("sap.ui.study.git.controller.list.TableExample", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sap.ui.study.git.table.view.Table_example
		 */
		onInit: function () {

		},
		onSearch: function(event,sPath){
			var aFilters = [],
				sQuery = event.getSource().getValue(),
				oTable = this.byId("tableExample"),
				oBinding, i;
			if(_Filter[sPath]){
				// _Filter[sPath].destroy();
				_Filter[sPath] = null;
			}
			if (sQuery && sQuery.length > 0) {
				_Filter[sPath] = new Filter(sPath, sap.ui.model.FilterOperator.Contains, sQuery);
			}
			for(i in _Filter){
				if(_Filter[i]){
					aFilters.push(_Filter[i]);
				}
			}
			oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters, "Application");
			
		}
	});

});