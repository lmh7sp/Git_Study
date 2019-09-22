sap.ui.define([
	"sap/ui/study/git/controller/BaseController",
	"sap/ui/study/git/controller/PersoService",
	"sap/ui/table/TablePersoController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/Token",
	"sap/m/MessageToast",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet"
], function (Controller, PersoService, TablePersoController, JSONModel, Filter, Token, MessageToast, ODataModel, MessageBox, Spreadsheet) {
	"use strict";

	return Controller.extend("sap.ui.study.git.controller.June.CommercialInvoice", {
		onInit: function () {
			var oView = this.getView();
			
			this._createTablePerso();
			this._setMainViewModel(oView);
			this._setPoPupModel(oView);
			this._setLayoutModel(oView);
			
		},
		config: {
			initialRank: 0,
			defaultRank: 9999999,
			rankAlgorithm: {
				Before: function(iRank) {
					return iRank + 9999999;
				},
				Between: function(iRank1, iRank2) {
					// limited to 53 rows
					return (iRank1 + iRank2) / 2;
				},
				After: function(iRank) {
					return iRank / 2;
				}
			}
		},
		_setLayoutModel : function(oView){
			oView.setModel(new JSONModel({
				ResultListCnt : 0,
				AssignedListCnt : 0,
				tableCnt : 0
			}), "layout");
		},
		_setMainViewModel  :function(oView){
			oView.setModel(new JSONModel([]), "CIDocJson");
		},
		_setPoPupModel  :function(oView){
			oView.setModel(new JSONModel([]), "ResultList");
			oView.setModel(new JSONModel([]), "AssignedList");
		},
		_createTablePerso: function () {
			// init and activate controller
			this._oTPC = new TablePersoController({
				table: this.getView().byId("CIDocList"),
				persoService: PersoService
			});
		},
		onPersoButtonPressed: function (oEvent) {
			this._oTPC.openDialog({
				contentWidth : "400px",
				contentHeight : "500px"
			});
		},
		onCreate : function(){
			var oView = this.getView();
			var oDialog = oView.byId("SearchDO");
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.study.git.fragment.SearchDO", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},
		onDelete : function(){
			var oView = this.getView(),
				oModel = oView.getModel("CommercialInvoice"),
				oJsonModel = oView.getModel("CIDocJson"),
				oTable = oView.byId("CIDocList"),
				aSelectedIdx = oTable.getSelectedIndices(),
				aCallDeleteArr = [];
			if(!aSelectedIdx.length){
				return MessageToast.show("There is no data selected.");
			}
			MessageBox.confirm("Are you sure you want to delete?", {
				actions: ["Confirm", sap.m.MessageBox.Action.CANCEL],
				styleClass: "sapUiSizeCompact",
				onClose: function(sAction) {
					if(sAction === "Confirm"){
						oTable.setBusy(true);
						aSelectedIdx.forEach(function(idx, i){
							var sContext = oTable.getContextByIndex(idx).getPath(),
								oRow = oJsonModel.getProperty(sContext);
							aCallDeleteArr.push(this._getODataDelete(oModel, "/YY1_COMMERCIAL_INVOICE(guid'"+oRow.SAP_UUID+"')"));
						}.bind(this));
						
						$.when.apply($, aCallDeleteArr).done(function(aReturn){
							MessageToast.show("Delete Complate!");
							this.onSearch();
						}.bind(this));
					}
				}.bind(this)
			});
		},
		onPrint : function(){
			var url = sap.ui.require.toUrl("sap/ui/study/git/html/CommercialInvoice.html");
			var oView = this.getView(),
				oTable = oView.byId("CIDocList"),
				oJsonModel = oView.getModel("CIDocJson"),
				oSalesOrderModel = oView.getModel("SalesOrder"),
				aSelectedIdx = oTable.getSelectedIndices(),
				aItemArr = [],
				aSalesOrderFilter = [];
				
			if(!aSelectedIdx.length){
				return MessageToast.show("Please selet");
			}
			if(aSelectedIdx.length > 1){
				return MessageToast.show("Please selet only one");
			}
			var sPath = oTable.getContextByIndex(aSelectedIdx[0]).getPath(),
				oRowData = this._copyObj(oJsonModel.getProperty(sPath));
 			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "MM-dd-YYYY" });   
			oRowData.DocumentDate = dateFormat.format(oRowData.DocumentDate);
			
			aItemArr = this._copyObj(oRowData.to_COMMERCIAL_INVOICE_ITEM.results);
			var aFilterDummy = aItemArr.map(function(item){
				return new Filter({
					filters : [
						new Filter("SalesOrder", "EQ", item.SalesOrder),
						new Filter("SalesOrderItem", "EQ", item.SalesOrderItem)
					],
					and : true
				});
			});
			aSalesOrderFilter.push(new Filter({
				filters : [
					new Filter({ filters : aFilterDummy, and : false }),
					new Filter("ConditionType", "EQ", "ZMP1")
				],
				and : true
			}));
			
			if(oRowData.MaskingPriceUseFlag === "Y"){
				this._getODataRead(oSalesOrderModel, "/A_SalesOrderItemPrElement", aSalesOrderFilter).done(function(aSalseOrderItem){
					var iGrandTotal = 0,
						flgMaskingPrice = false,
						oSalseOrderObj = aSalseOrderItem.reduce(function(total, row){
							var sKey =row.SalesOrder + "_" + row.SalesOrderItem;
							if(!total[sKey]){
								total[sKey] = [];
							}
							total[sKey].push(row);
							return total;
						}, {});
					window._getItem = aItemArr.map(function(item){
						var sKey = item.SalesOrder + "_" + item.SalesOrderItem,
							iUnitPrice = "0";
						
						if(oSalseOrderObj[sKey]){
							iUnitPrice = oSalseOrderObj[sKey][0].ConditionRateValue;
						}else{
							flgMaskingPrice = true;
						}
						iGrandTotal = ( iGrandTotal + Number(iUnitPrice) ).toFixed(2);
						
						item.MPPrice = Number(iUnitPrice).toFixed(2);
						item.MPAmount = ( Number(item.Qty) * Number(iUnitPrice) ).toFixed(2);
						return item;
					});
					oRowData.GrandTotal = iGrandTotal.toString();
					if(flgMaskingPrice){
						MessageBox.warning("Masking price not found.");
					}
					window._getHeader = oRowData;
					window.open(url, "_blink");
				});
			}else{
				window._getHeader = oRowData;
				window._getItem = aItemArr.map(function(item){
					item.MPPrice = item.UnitPrice;
					item.MPAmount = item.Amount;
					return item;
				});
				window.open(url, "_blink");
			}
			
		},
		onSearch : function(){
			var oView = this.getView(),
				oJsonModel = oView.getModel("CIDocJson"),
				oLayoutModel = oView.getModel("layout"),
				oTable = oView.byId("CIDocList"),
				oFilterBar = oView.byId("oFilterBar");
			var aFilter = [],
				aFilterItems = oFilterBar.getFilterGroupItems();
				
			aFilterItems.forEach(function(item){
				var sFieldName = item.getName(),
					oControl = item.getControl(),
					oFilter = this._getControlValue(oControl, sFieldName);
				if(oFilter){
					aFilter.push(oFilter);
				}
			}.bind(this));
			
			oTable.setBusy(true);
			oTable.setSelectedIndex(-1);
			oJsonModel.setProperty("/", []);
			oLayoutModel.setProperty("/tableCnt", 0);
			
			var aResults = this._getDataHeader();
			
			oJsonModel.setProperty("/", aResults.map(function(item){
				return item;
			}));
			oLayoutModel.setProperty("/tableCnt", aResults.length);
			oTable.setBusy(false);
		},
		_getDataHeader : function(){
			return [];
		},
		onDetailPage : function(oEvent){
			var oTemplate = oEvent.getSource(),
				oRowTemplate = oTemplate.getParent().getParent(),
				iIndex = oRowTemplate.getIndex();
			var oView = this.getView(),
				oTable = oView.byId("CIDocList"),
				oTableModel = oView.getModel("CIDocJson"),
				sContext = oTable.getContextByIndex(iIndex).getPath(),
				oRowData = oTableModel.getProperty(sContext);
			
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("CreateCommercialInvoice",{
				LayoutOption : "Display",
				List : JSON.stringify([oRowData.EXCINO]),
				ShipToParty : oRowData.ShipToParty,
				SoldToParty : oRowData.SoldToParty
			});
			oTableModel.setProperty("/", []);
		},
		onDataExport :function(){
			
		},
		
		//////////////////////////////////////////////////////////////////////
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
		_getODataDateValue : function(oDate, fromTo){
			var oReturnDate = null;
			
			if(oDate && oDate.getFullYear){
				var sYear = oDate.getFullYear(),
					sMonth = oDate.getMonth(),
					sDate = oDate.getDate();
				if(fromTo === "to"){
					oReturnDate = new Date(sYear,sMonth,sDate,32,59,59).toISOString();
				}else{
					oReturnDate = new Date(sYear,sMonth,sDate,9).toISOString();
				}
			}
			
			return oReturnDate;
		},
		onSearchDO : function(){
			var oView = this.getView(),
				oFilterBar = oView.byId("SearchDOFilterBar"),
				oTable = oView.byId("ResultList"),
				oJsonModel = oView.getModel("ResultList"),
				oLayoutModel = oView.getModel("layout"),
				oBPModel = oView.getModel("BusinessPartner"),
				oModel = oView.getModel("OutboundDelivery"),
				aFilter = [];
			
			var aFilterItems = oFilterBar.getFilterGroupItems();
				
			aFilterItems.forEach(function(item){
				var sFieldName = item.getName(),
					oControl = item.getControl(),
					oFilter = this._getControlValue(oControl, sFieldName);
				if(oFilter){
					aFilter.push(oFilter);
				}
			}.bind(this));
			oTable.setBusy(true);
			oJsonModel.setProperty("/", []);
			oLayoutModel.setProperty("/ResultListCnt", 0);
			this._getODataRead(oModel, "/A_OutbDeliveryHeader", aFilter).done(function(aResults){
				var aBPFilter = [],
					aBPArr = [];
				aResults.forEach(function(item){
					var sSoldToParty = item.SoldToParty,
						sShipToParty = item.ShipToParty;
					if(!aBPArr.includes(sSoldToParty)){
						aBPArr.push(sSoldToParty);
						aBPFilter.push(new Filter("BusinessPartner", "EQ", sSoldToParty));
					}
					if(!aBPArr.includes(sShipToParty)){
						aBPArr.push(sShipToParty);
						aBPFilter.push(new Filter("BusinessPartner", "EQ", sShipToParty));
					}
				});
				this._getODataRead(oBPModel, "/A_BusinessPartner", [
					new Filter({ filters : aBPFilter, and : false })
				]).done(function(aBPArr){
					var oBPObj = aBPArr.reduce(function(total, item){
						var sKey = item.BusinessPartner;
						if(!total[sKey]){
							total[sKey] = [];
						}
						total[sKey].push(item);
						return total;
					},{});
					oJsonModel.setProperty("/", aResults.map(function(item){
						item.Rank = 0;
						if(oBPObj[item.SoldToParty]){
							item.SoldToPartyName = oBPObj[item.SoldToParty][0].BusinessPartnerName;
						}
						if(oBPObj[item.ShipToParty]){
							item.ShipToPartyName = oBPObj[item.ShipToParty][0].BusinessPartnerName;
						}
						return item;
					}));
					oLayoutModel.setProperty("/ResultListCnt", aResults.length);
					oTable.setBusy(false);
				});
			}.bind(this));
		},
		onAssign : function(){
			var oView = this.getView(),
				oJsonModel = oView.getModel("ResultList"),
				oTable = oView.byId("ResultList"),
				oTable2 = this.byId("AssignedList"),
				iSelectedIndices = oTable.getSelectedIndices();
				
			for(var i = iSelectedIndices.length; i >= 0; i--){
				var idxItem = iSelectedIndices[i];
				var oSelectedRowContext = oTable.getContextByIndex(idxItem),
					oFirstRowContext = oTable2.getContextByIndex(0);
				
				var iNewRank = this.config.defaultRank;
				if (oFirstRowContext) {
					iNewRank =  this.config.rankAlgorithm.Before(oFirstRowContext.getProperty("Rank"));
				}

				oJsonModel.setProperty("Rank", iNewRank, oSelectedRowContext);

			}
			oJsonModel.refresh(true);
			// oTable2.setSelectedIndex(0);
			oTable.setSelectedIndex(-1);
		},
		onRemove : function(){
			var oView = this.getView(),
				oJsonModel = oView.getModel("ResultList"),
				oTable = oView.byId("AssignedList"),
				iSelectedIndices = oTable.getSelectedIndices();
			
			for(var i = iSelectedIndices.length; i >= 0; i--){
				var idxItem = iSelectedIndices[i];
				var oSelectedRowContext = oTable.getContextByIndex(idxItem);
				
				oJsonModel.setProperty("Rank", this.config.initialRank, oSelectedRowContext);
				
			}
			oTable.setSelectedIndex(-1);
			oJsonModel.refresh(true);
		},
		onCloseDialog : function () {
			var oView = this.getView(),
				oLayoutModel = oView.getModel("layout"),
				oJsonModel = oView.getModel("ResultList");
			
			oJsonModel.setProperty("/", []);
			oLayoutModel.setProperty("/ResultListCnt", 0);
			this.getView().byId("SearchDO").close();
		},
		onContinueDialog : function(){
			var oView = this.getView(),
				oJsonModel = oView.getModel("ResultList"),
				oLayoutModel = oView.getModel("layout"),
				oTable = oView.byId("AssignedList"),
				oModel = oView.getModel("CommercialInvoice"),
				oTableModel = oView.getModel("CIDocJson"),
				aContexts = oTable.getBinding().getContexts(),
				aSelectedArr = [];
			var aSoldTo = [], aShipTo = [], aPlannedGIDate = [], aIncoTerms = [], aDeliveryFilter = [];
			var sSoldToParty = "", sShipToParty = "";
			aContexts.forEach(function(item){
				var sPath = item.getPath(),
					oRow = oJsonModel.getProperty(sPath);
				aSelectedArr.push(oRow.DeliveryDocument);
				if(!aSoldTo.includes(oRow.SoldToParty)){
					aSoldTo.push(oRow.SoldToParty);
					sSoldToParty = oRow.SoldToParty;
				}
				if(!aShipTo.includes(oRow.ShipToParty)){
					aShipTo.push(oRow.ShipToParty);
					sShipToParty = oRow.ShipToParty;
				}
				if(oRow.PlannedGoodsIssueDate.valueOf && !aPlannedGIDate.includes(oRow.PlannedGoodsIssueDate.valueOf())){
					aPlannedGIDate.push(oRow.PlannedGoodsIssueDate.valueOf());
				}
				if(!aIncoTerms.includes(oRow.IncotermsClassification)){
					aIncoTerms.push(oRow.IncotermsClassification);
				}
				
				aDeliveryFilter.push(new Filter("DeliveryDocument", "EQ", oRow.DeliveryDocument));
			});
			if(aSoldTo.length > 1|| aShipTo.length > 1 || aPlannedGIDate.length > 1 || aIncoTerms.length > 1){
				return MessageToast.show("Check Your data. SoldTo/ShipTo/PlannedGIDate/IncoTerms Should be the same.");
			}
			this._getODataRead(oModel, "/YY1_COMMERCIAL_INVOICE", [
				new Filter({ filters : aDeliveryFilter, and : false })
			]).done(function(aResults){
				if(aResults.length){
					return MessageToast.show("The DeliveryDocument Number already exists");
				}
				oView.byId("SearchDO").close();
				oJsonModel.setProperty("/", []);
				oLayoutModel.setProperty("/ResultListCnt", 0);
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Detail",{
					LayoutOption : "Create",
					List : JSON.stringify(aSelectedArr),
					ShipToParty : sShipToParty,
					SoldToParty : sSoldToParty
				}, true);
				oTableModel.setProperty("/", []);
			}.bind(this));
		},
		_getColumnConfig : function(){
			var oView = this.getView(),
				oTable = oView.byId("CIDocList"),
				aCols = oTable.getColumns(),
				aColConfig = [];
			aCols.forEach(function(col){
				aColConfig.push({ label : col.getLabel().getText(), property : col.getTemplate().getBindingPath("text") });
			});
			
			return aColConfig;
		},
		_getTableData : function(){
			var oView = this.getView(),
				oModel = oView.getModel("CIDocJson"),
				aTableArr = oModel.getProperty("/");
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "MM/dd/YYYY" });   
			return aTableArr.map(function(item){
				item.PlannedGoodsIssueDate = dateFormat.format(item.PlannedGoodsIssueDate);
				item.ActualGoodsIssueDate = dateFormat.format(item.ActualGoodsIssueDate);
				item.DocumentDate = dateFormat.format(item.DocumentDate);
				return item;
			});
		},
		onExcelDownLoad : function(){
			var oView = this.getView(),
				aDataSource = this._getTableData(),
				aColumnConfig = this._getColumnConfig(),
				oI18n = oView.getModel("i18n"),
				sTitle = oI18n.bindProperty("title").getValue();
			var oSettings = {
				workbook: { columns: aColumnConfig },
				dataSource: aDataSource,
				fileName : sTitle + ".xlsx"
			};

			var oSheet = new Spreadsheet(oSettings);
			
			oSheet.build().finally(function() {
				oSheet.destroy();
			});
		}
	});
});