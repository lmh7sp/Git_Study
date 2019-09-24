sap.ui.define([
	"sap/ui/study/git/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/export/Spreadsheet",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/SearchField",
	"sap/ui/table/TablePersoController",
	"sap/m/Token",
	"sap/ui/study/git/controller/PersoService",
	"sap/ui/core/util/File"
], function (BaseController, MessageToast, Spreadsheet, Filter, FilterOperator, 
 JSONModel, ODataModel, SearchField, TablePersoController, Token, PersoService, File) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.June.PurchaseInfo", {
		onInit: function () {
			var oView = this.getView(),
				oLayout = new JSONModel({itemLength : 0});
			
			oView.setModel(new ODataModel("/sap/opu/odata/sap/YY1_MM002_PURCHASE_CDS/"), "oOdataModel");
			oView.setModel(new JSONModel(), "mainModel");
			oView.setModel(oLayout, "layout");
			
			this._oTPC = new TablePersoController({
				table: this.getView().byId("tableModel"),
				persoService: PersoService
			});
			
			oView.setModel(new JSONModel([
				{ Code : "0", Name : "Standard"},
				{ Code : "3", Name : "Subcontract "}
			]), "PurchasingCategory");
			
			this._setMultiInputValidation(oView.byId("mutiProduct"));
			this._setMultiInputValidation(oView.byId("mutiProductGroup"));
			this._setMultiInputValidation(oView.byId("mutiSupplier"));
			this._setMultiInputValidation(oView.byId("mutiPlant"));
			this._setMultiInputValidation(oView.byId("mutiRecordCat"));
			
		},
		_setMultiInputValidation : function(oMultiInput){
			oMultiInput.addValidator(function(args){
				var oItem = args.suggestionObject, key="", text="";
				if (oItem){
					key = oItem.getKey();
					text = key + "(" + oItem.getAdditionalText() + ")";
					oMultiInput.setValueState("None");
					return new Token({key: key, text: text});
				}
				oMultiInput.setValueState("Error");
				return null;
			});
		},
		onPersoButtonPressed: function (oEvent) {
			this._oTPC.openDialog();
		},
		onSearch : function(oEvnet) {
			var oView = this.getView(), 
				self = this,
				oTemplate = oEvnet.getSource(),
				oTable = oView.byId("tableModel"),
				oOdataModel = oView.getModel("oOdataModel"), 
				oModel = oView.getModel("mainModel"), 
				oLayout = oView.getModel("layout");
			var aFilterItems = oTemplate.getFilterGroupItems(),
				aFilter = [];
			
			aFilterItems.forEach(function(item){
				var sFieldName = item.getName();
				switch(sFieldName) {
					case "InfoRecordCategory" :
						sFieldName = "PurchasingInfoRecordCategor";
						break;
				}
				var oControl = item.getControl(),
					oFilter = this._getControlValue(oControl, sFieldName);
				if(oFilter){
					aFilter.push(oFilter);
				}
			}.bind(this));
			
			// oTable.setBusy(true);
			// oTable.setSelectedIndex(-1);
			// oLayout.setProperty("/itemLength", 0);
			
			// oModel.setProperty("/", []);
			
			// oOdataModel.read("/YY1_MM002_Purchase", {
			// 	filters : aFilter,
			// 	success : function(oReturn) {
			// 		var oResults = oReturn.results,
			// 			aTableRows = [];
					
			// 		var oStorageLocation = self._aListText["StorageLocation"].reduce(function(total, item){
			// 				var sKey = item.StorageLocation;
			// 				if(!total[sKey]){
			// 					total[sKey] = [];
			// 				}
			// 				total[sKey].push(item);
			// 				return total;
			// 		}, {}),
			// 			oProduct = self._aListText["Product"].reduce(function(total, item){
			// 				var sKey = item.Product;
			// 				if(!total[sKey]){
			// 					total[sKey] = [];
			// 				}
			// 				total[sKey].push(item);
			// 				return total;
			// 		}, {}),
			// 			oSupplier = self._aListText["Supplier"].reduce(function(total, item){
			// 				var sKey = item.Supplier;
			// 				if(!total[sKey]){
			// 					total[sKey] = [];
			// 				}
			// 				total[sKey].push(item);
			// 				return total;
			// 		}, {}),
			// 		oPlant = self._aListText["Plant"].reduce(function(total, item){
			// 				var sKey = item.Plant;
			// 				if(!total[sKey]){
			// 					total[sKey] = [];
			// 				}
			// 				total[sKey].push(item);
			// 				return total;
			// 		}, {});
			// 		oResults.forEach(function(item, idx) {
						
			// 			/* Text Setting */
			// 			if(oPlant[item.Plant]) {
			// 				item.PlantName = oPlant[item.Plant][0].PlantName;
			// 			}
			// 			if(oStorageLocation[item.StorageLocation]) {
			// 				item.StorageLocationText = oStorageLocation[item.StorageLocation][0].StorageLocationName;
			// 			}
			// 			if(oProduct[item.Material]) {
			// 				item.ProductText = oProduct[item.Material][0].ProductName;
			// 				item.ProductGroupName = oProduct[item.Material][0].MaterialGroupName;
			// 			}
			// 			if(oSupplier[item.Supplier]) {
			// 				item.SupplierName = oSupplier[item.Supplier][0].SupplierName;
			// 			}
			// 			if(item.InvoiceIsGoodsReceiptBased){
			// 				item.InvoiceIsGoodsReceiptBased = "X";
			// 			}else{
			// 				item.InvoiceIsGoodsReceiptBased = "";
			// 			}
						
			// 			aTableRows.push(item);
			// 		});
					
			// 		oTable.setBusy(false);
			// 		oTable.setSelectedIndex(-1);
			// 		oModel.setProperty("/", aTableRows);
			// 		oLayout.setProperty("/itemLength", aTableRows.length);
			// 	}
			// });
			
		},
		
		_getControlValue : function(oControl, sFieldName){
			var oFilter = null, sValue = null, sValue2 = null;
			
			if(oControl instanceof sap.m.MultiInput){
				sValue = oControl.getTokens();
				if(sValue.length){
					oFilter = new Filter({
						filters : sValue.map(function(oToken){
							return new Filter(sFieldName, "EQ", oToken.getKey());
						}),
						and : false
					});
				}
			}else if(oControl instanceof sap.m.Input){
				sValue = oControl.getValue();
				if(sValue){
					oFilter = new Filter(sFieldName, "EQ", sValue);
				}
			}else if(oControl instanceof sap.m.DateRangeSelection){
				sValue = this._getODataDateValue(oControl.getDateValue());
				sValue2 = this._getODataDateValue(oControl.getSecondDateValue(), "to") || sValue;
				if(sValue){
					oFilter = new Filter(sFieldName, "BT", sValue, sValue2);
				}
			}
			
			return oFilter;
		},
		
		_getODataRead : function(name, oModel, readContext, aFilter, oParameters){
			var self = this,
				deferred = $.Deferred();
			
			self._aListText = [];
			
			if(self._aListText[name]) {
				deferred.resolve();
				return deferred.promise();
			}
			
			oModel.read(readContext,{
				urlParameters: oParameters,
				filters : aFilter,
				success : function(oReturn){
					var aResult = oReturn.results;
					self._aListText[name] = aResult;
					deferred.resolve(aResult);
				},
				error: function(oError) { 
					try {
						if(oError.responseText){
							var oResponseTextData = JSON.parse(oError.responseText);
							MessageToast.show(oResponseTextData.error.message.value);
						}else{
							MessageToast.show(oError.statusText);	
						}
						deferred.reject();
					} catch (e) {
						MessageToast.show("오류가 발생했습니다.");
					}
				}
			});
			return deferred.promise();
		},
		
		
		onMultiValueHelpDialog : function(oEvent, sGubunField, sSearchField){
			var oInput = oEvent.getSource(),
				oParamer = {},
				aFilter = [];
			switch(sGubunField){
				case "Product":
					oParamer = {
						title : "{i18n>dialogProductHeader}", 
						EntitySet : "Product>/YY1_ProductView", 
						TitleProperty : "{Product>Product}",
						DescriptionProperty : "{Product>ProductName}",
						TitleFilterField : "Product",
						DescFilterField : "ProductName"
					};
					break;
				case "ProductGroup":
					oParamer = {
						title : "{i18n>dialogProductGroupHeader}", 
						EntitySet : "ProductGroup>/YY1_ProductGroupView", 
						TitleProperty : "{ProductGroup>MaterialGroup}",
						DescriptionProperty : "{ProductGroup>MaterialGroupName}",
						TitleFilterField : "MaterialGroup",
						DescFilterField : "MaterialGroupName"
					};
					break;
				case "Supplier":
					oParamer = {
						title : "{i18n>dialogSupplierHeader}", 
						EntitySet : "BusinessPartner>/A_Supplier", 
						TitleProperty : "{BusinessPartner>Supplier}",
						DescriptionProperty : "{BusinessPartner>SupplierName}",
						TitleFilterField : "Supplier",
						DescFilterField : "SupplierName"
					};
					break;
				case "Plant":
					oParamer = {
						title : "{i18n>dialogPlantHeader}", 
						EntitySet : "Plant>/A_Plant", 
						TitleProperty : "{Plant>Plant}",
						DescriptionProperty : "{Plant>PlantName}",
						TitleFilterField : "Plant",
						DescFilterField : "PlantName"
					};
					break;
				case "InfoRecordCategory":
					oParamer = {
						title : "{i18n>dialogInfoRecordCategoryHeader}", 
						EntitySet : "PurchasingCategory>/", 
						TitleProperty : "{PurchasingCategory>Code}",
						DescriptionProperty : "{PurchasingCategory>Name}",
						TitleFilterField : "Code",
						DescFilterField : "Name"
					};
					break;
				case "PurchasingOrganization":
					oParamer = {
						title : "{i18n>dialogPurchasingOrganizationHeader}", 
						EntitySet : "PurchaseOrg>/YY1_PurchasingOrg", 
						TitleProperty : "{PurchaseOrg>PurchasingOrganization}",
						DescriptionProperty : "{PurchaseOrg>PurchasingOrganizationName}",
						TitleFilterField : "PurchasingOrganization",
						DescFilterField : "PurchasingOrganizationName"
					};
					break;
			}
			oParamer.dialogName = sGubunField;
			this._openMultiSearchDialog(oParamer, aFilter, function(aCodeList){
				oInput.setValue("");
				oInput.setTokens(
					aCodeList.map(function(item){
						return new Token({text: item.code, key: item.code});

					})
				);
				oInput.setValueState("None");
			});
		},
		
		onExport : function() {
			var oTable = this.getView().byId("tableModel"),
				aColumns = oTable.getColumns(), 
				aColumnConfig = [];
				
			aColumns.forEach(function(col){
				var itemTemplate = col.getTemplate();
				var sProperty = itemTemplate.getBindingPath("text");
				var sType = "string";
				if(!sProperty) {
					sProperty = itemTemplate.getBindingPath("value");
				}
				
				if(itemTemplate.getMetadata().getElementName() === "sap.m.Text" &&
				itemTemplate.getBindingInfo("text").parts[0].type !== undefined) { // odata type setting
					var textPattern = itemTemplate.getBindingInfo("text").type.oFormatOptions.pattern;
					if(textPattern === "yyyy.MM.dd") {
						sType = "date";
					}
					if(textPattern === "HH:mm:ss") {
						sType = "datetime";
					}
				}
				
				var sText = "";
				if(col.getLabel() === null) {
					sText = col.getMultiLabels()[0].getText().trim();
				} else {
					sText = col.getLabel().getText();
				}
				aColumnConfig.push({
					label : sText,
					type : sType,
					property : sProperty
				});
			});
			
			var oRowBinding, oSettings, oSheet;
				oRowBinding = oTable.getBinding();
			var oModel = oRowBinding.getModel(),
				sPath = oRowBinding.sPath,
				aModelData = oModel.getProperty(sPath);
			
			if(!aModelData.length) {
				return MessageToast.show("조회 된 데이터가 없습니다.");
			}
			oSettings = {
				workbook: { columns: aColumnConfig },
				fileName : "Purchase_Info_Record",
				dataSource: aModelData.map(function(item){
					if(Number(item.PurchasingInfoRecordCategor)){
						item.PurchasingInfoRecordCategor = "Subcontract";
					}else{
						item.PurchasingInfoRecordCategor = "Standard";
					}
					return item;
				})
			};
	
			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				oSheet.destroy();
			});
		}
	});
});





