﻿/***********************************************
* ng-grid JavaScript Library
* Authors: https://github.com/angular-ui/ng-grid/blob/master/README.md
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 01/19/2013 16:23:56
***********************************************/
(function (window) {
    'use strict'; if (!window.ng) { window.ng = {}; }
    window.ngGrid = {}; window.ngGrid.i18n = {}; var ngGridServices = angular.module('ngGrid.services', []); var ngGridDirectives = angular.module('ngGrid.directives', []); var ngGridFilters = angular.module('ngGrid.filters', []); var SELECTED_PROP = '__ng_selected__'; var EXCESS_ROWS = 8; var SCROLL_THRESHOLD = 6; var ASC = "asc"; var DESC = "desc"; var NG_FIELD = '_ng_field_'; var NG_DEPTH = '_ng_depth_'; var NG_HIDDEN = '_ng_hidden_'; var NG_COLUMN = '_ng_column_'; var CUSTOM_FILTERS = /CUSTOM_FILTERS/g; var COL_FIELD = /COL_FIELD/g; var TEMPLATE_REGEXP = /<.+>/; ng.moveSelectionHandler = function ($scope, elm, evt) {
        if ($scope.selectionService.selectedItems === undefined) { return true; }
        var charCode = evt.which || evt.keyCode; var offset = (charCode == 38 ? -1 : (charCode == 40 ? 1 : null)); if (!offset) { return true; }
        var items = $scope.renderedRows; var index = items.indexOf($scope.selectionService.lastClickedRow) + offset; if (index < 0 || index >= items.length) { return true; }
        $scope.selectionService.ChangeSelection(items[index], evt); if (index > items.length - EXCESS_ROWS) { elm.scrollTop(elm.scrollTop() + ($scope.rowHeight * 2)); } else if (index < EXCESS_ROWS) { elm.scrollTop(elm.scrollTop() - ($scope.rowHeight * 2)); }
        if (!$scope.$$phase) { $scope.$parent.$digest(); }
        return false;
    }; if (!String.prototype.trim) { String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); }; }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elt) {
            var len = this.length >>> 0; var from = Number(arguments[1]) || 0; from = (from < 0) ? Math.ceil(from) : Math.floor(from); if (from < 0) { from += len; }
            for (; from < len; from++) { if (from in this && this[from] === elt) { return from; } }
            return -1;
        };
    }
    if (!Array.prototype.filter) {
        Array.prototype.filter = function (fun) {
            "use strict"; var t = Object(this); var len = t.length >>> 0; if (typeof fun !== "function") { throw new TypeError(); }
            var res = []; var thisp = arguments[1]; for (var i = 0; i < len; i++) { if (i in t) { var val = t[i]; if (fun.call(thisp, val, i, t)) { res.push(val); } } }
            return res;
        };
    }
    ng.utils = {
        visualLength: function (node) {
            var elem = document.getElementById('testDataLength'); if (!elem) { elem = document.createElement('SPAN'); elem.id = "testDataLength"; elem.style.visibility = "hidden"; document.body.appendChild(elem); }
            $(elem).css('font', $(node).css('font')); elem.innerHTML = $(node).text(); return elem.offsetWidth;
        }, forIn: function (obj, action) { for (var prop in obj) { if (obj.hasOwnProperty(prop)) { action(obj[prop], prop); } } }, evalProperty: function (entity, path) {
            var propPath = path.split('.'), i = 0; var tempProp = entity[propPath[i]], links = propPath.length; i++; while (tempProp && i < links) { tempProp = tempProp[propPath[i]]; i++; }
            return tempProp;
        }, endsWith: function (str, suffix) {
            if (!str || !suffix || typeof str != "string") { return false; }
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }, isNullOrUndefined: function (obj) {
            if (obj === undefined || obj === null) { return true; }
            return false;
        }, getElementsByClassName: function (cl) {
            var retnode = []; var myclass = new RegExp('\\b' + cl + '\\b'); var elem = document.getElementsByTagName('*'); for (var i = 0; i < elem.length; i++) { var classes = elem[i].className; if (myclass.test(classes)) { retnode.push(elem[i]); } }
            return retnode;
        }, newId: (function () { var seedId = new Date().getTime(); return function () { return seedId += 1; }; })(), seti18n: function ($scope, language) { var $langPack = window.ngGrid.i18n[language]; for (var label in $langPack) { $scope.i18n[label] = $langPack[label]; } }, ieVersion: (function () { var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i'); while (div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->', iElems[0]); return version > 4 ? version : undefined; })()
    }; $.extend(ng.utils, { isIe6: (function () { return ng.utils.ieVersion === 6; })(), isIe7: (function () { return ng.utils.ieVersion === 7; })(), isIe: (function () { return ng.utils.ieVersion !== undefined; })() }); ngGridFilters.filter('ngColumns', function () { return function (input) { return input.filter(function (col) { return !col.isAggCol; }); }; }); ngGridFilters.filter('checkmark', function () { return function (input) { return input ? '\u2714' : '\u2718'; }; }); ngGridServices.factory('SortService', function () {
        var sortService = {}; sortService.colSortFnCache = {}; sortService.dateRE = /^(\d\d?)[\/\.-](\d\d?)[\/\.-]((\d\d)?\d\d)$/; sortService.guessSortFn = function (item) {
            var sortFn, itemType, dateParts, month, day; if (item === undefined || item === null || item === '') { return null; }
            itemType = typeof (item); switch (itemType) { case "number": sortFn = sortService.sortNumber; break; case "boolean": sortFn = sortService.sortBool; break; default: sortFn = undefined; break; }
            if (sortFn) { return sortFn; }
            if (Object.prototype.toString.call(item) === '[object Date]') { return sortService.sortDate; }
            if (itemType !== "string") { return sortService.basicSort; }
            if (item.match(/^-?[£$¤]?[\d,.]+%?$/)) { return sortService.sortNumberStr; }
            dateParts = item.match(sortService.dateRE); if (dateParts) { month = parseInt(dateParts[1], 10); day = parseInt(dateParts[2], 10); if (month > 12) { return sortService.sortDDMMStr; } else if (day > 12) { return sortService.sortMMDDStr; } else { return sortService.sortMMDDStr; } }
            return sortService.sortAlpha;
        }; sortService.basicSort = function (a, b) {
            if (a == b) { return 0; }
            if (a < b) { return -1; }
            return 1;
        }; sortService.sortNumber = function (a, b) { return a - b; }; sortService.sortNumberStr = function (a, b) {
            var numA, numB, badA = false, badB = false; numA = parseFloat(a.replace(/[^0-9.-]/g, '')); if (isNaN(numA)) { badA = true; }
            numB = parseFloat(b.replace(/[^0-9.-]/g, '')); if (isNaN(numB)) { badB = true; }
            if (badA && badB) { return 0; }
            if (badA) { return 1; }
            if (badB) { return -1; }
            return numA - numB;
        }; sortService.sortAlpha = function (a, b) { var strA = a.toLowerCase(), strB = b.toLowerCase(); return strA == strB ? 0 : (strA < strB ? -1 : 1); }; sortService.sortDate = function (a, b) { var timeA = a.getTime(), timeB = b.getTime(); return timeA == timeB ? 0 : (timeA < timeB ? -1 : 1); }; sortService.sortBool = function (a, b) {
            if (a && b) { return 0; }
            if (!a && !b) { return 0; } else { return a ? 1 : -1; }
        }; sortService.sortDDMMStr = function (a, b) {
            var dateA, dateB, mtch, m, d, y; mtch = a.match(sortService.dateRE); y = mtch[3]; m = mtch[2]; d = mtch[1]; if (m.length == 1) { m = '0' + m; }
            if (d.length == 1) { d = '0' + d; }
            dateA = y + m + d; mtch = b.match(sortService.dateRE); y = mtch[3]; m = mtch[2]; d = mtch[1]; if (m.length == 1) { m = '0' + m; }
            if (d.length == 1) { d = '0' + d; }
            dateB = y + m + d; if (dateA == dateB) { return 0; }
            if (dateA < dateB) { return -1; }
            return 1;
        }; sortService.sortMMDDStr = function (a, b) {
            var dateA, dateB, mtch, m, d, y; mtch = a.match(sortService.dateRE); y = mtch[3]; d = mtch[2]; m = mtch[1]; if (m.length == 1) { m = '0' + m; }
            if (d.length == 1) { d = '0' + d; }
            dateA = y + m + d; mtch = b.match(sortService.dateRE); y = mtch[3]; d = mtch[2]; m = mtch[1]; if (m.length == 1) { m = '0' + m; }
            if (d.length == 1) { d = '0' + d; }
            dateB = y + m + d; if (dateA == dateB) { return 0; }
            if (dateA < dateB) { return -1; }
            return 1;
        }; sortService.sortData = function (data, sortInfo) {
            if (!data || !sortInfo) { return; }
            var col = sortInfo.column, direction = sortInfo.direction, sortFn, item; if (sortService.colSortFnCache[col.field]) { sortFn = sortService.colSortFnCache[col.field]; } else if (col.sortingAlgorithm != undefined) { sortFn = col.sortingAlgorithm; sortService.colSortFnCache[col.field] = col.sortingAlgorithm; } else {
                item = data[0]; if (!item) { return; }
                sortFn = sortService.guessSortFn(item[col.field]); if (sortFn) { sortService.colSortFnCache[col.field] = sortFn; } else { sortFn = sortService.sortAlpha; }
            }
            data.sort(function (itemA, itemB) {
                var propA = ng.utils.evalProperty(itemA, col.field); var propB = ng.utils.evalProperty(itemB, col.field); if ((!propA && propA != 0) || (!propB && propB != 0)) { if (!propB && !propA) { return 0; } else if (!propA) { return 1; } else if (!propB) { return -1; } }
                if (direction === ASC) { return sortFn(propA, propB); } else { return 0 - sortFn(propA, propB); }
            }); return;
        }; sortService.Sort = function (sortInfo, data) {
            if (sortService.isSorting) { return; }
            sortService.isSorting = true; sortService.sortData(data, sortInfo); sortService.isSorting = false;
        }; return sortService;
    }); ngGridServices.factory('DomUtilityService', function () {
        var domUtilityService = {}; var getWidths = function () { var $testContainer = $('<div></div>'); $testContainer.appendTo('body'); $testContainer.height(100).width(100).css("position", "absolute").css("overflow", "scroll"); $testContainer.append('<div style="height: 400px; width: 400px;"></div>'); domUtilityService.ScrollH = ($testContainer.height() - $testContainer[0].clientHeight); domUtilityService.ScrollW = ($testContainer.width() - $testContainer[0].clientWidth); $testContainer.empty(); $testContainer.attr('style', ''); $testContainer.append('<span style="font-family: Verdana, Helvetica, Sans-Serif; font-size: 14px;"><strong>M</strong></span>'); domUtilityService.LetterW = $testContainer.children().first().width(); $testContainer.remove(); }; domUtilityService.eventStorage = {}; domUtilityService.AssignGridContainers = function ($scope, rootEl, grid) { grid.$root = $(rootEl); grid.$topPanel = grid.$root.find(".ngTopPanel"); grid.$groupPanel = grid.$root.find(".ngGroupPanel"); grid.$headerContainer = grid.$topPanel.find(".ngHeaderContainer"); grid.$headerScroller = grid.$topPanel.find(".ngHeaderScroller"); grid.$headers = grid.$headerScroller.children(); grid.$viewport = grid.$root.find(".ngViewport"); grid.$canvas = grid.$viewport.find(".ngCanvas"); grid.$footerPanel = grid.$root.find(".ngFooterPanel"); domUtilityService.UpdateGridLayout($scope, grid); }; domUtilityService.UpdateGridLayout = function ($scope, grid) { var scrollTop = grid.$viewport.scrollTop(); grid.elementDims.rootMaxW = grid.$root.width(); grid.elementDims.rootMaxH = grid.$root.height(); grid.refreshDomSizes(); $scope.adjustScrollTop(scrollTop, true); }; domUtilityService.numberOfGrids = 0; domUtilityService.BuildStyles = function ($scope, grid, digest) {
            var rowHeight = grid.config.rowHeight, $style = grid.$styleSheet, gridId = grid.gridId, css, cols = $scope.visibleColumns(), sumWidth = 0; if (!$style) { $style = $('#' + gridId); if (!$style[0]) { $style = $("<style id='" + gridId + "' type='text/css' rel='stylesheet' />").appendTo(grid.$root); } }
            $style.empty(); var trw = $scope.totalRowWidth(); css = "." + gridId + " .ngCanvas { width: " + trw + "px; }" + "." + gridId + " .ngRow { width: " + trw + "px; }" + "." + gridId + " .ngCanvas { width: " + trw + "px; }" + "." + gridId + " .ngHeaderScroller { width: " + (trw + domUtilityService.scrollH + 2) + "px}"; angular.forEach(cols, function (col, i) { css += "." + gridId + " .col" + i + " { width: " + col.width + "px; left: " + sumWidth + "px; right: " + (trw - sumWidth - col.width) + "px; height: " + rowHeight + "px }" + "." + gridId + " .colt" + i + " { width: " + col.width + "px; }"; sumWidth += col.width; }); if (ng.utils.isIe) { $style[0].styleSheet.cssText = css; } else { $style[0].appendChild(document.createTextNode(css)); }
            grid.$styleSheet = $style; if (digest) { domUtilityService.digest($scope); }
        }; domUtilityService.RebuildGrid = function ($scope, grid) {
            domUtilityService.UpdateGridLayout($scope, grid); if (grid.config.maintainColumnRatios) { grid.configureColumnWidths(); }
            domUtilityService.BuildStyles($scope, grid, true);
        }; domUtilityService.digest = function ($scope) { if (!$scope.$$phase) { $scope.$digest(); } }; domUtilityService.ScrollH = 17; domUtilityService.ScrollW = 17; domUtilityService.LetterW = 10; getWidths(); return domUtilityService;
    }); ng.defaultGridTemplate = function () { return '<div class="ngTopPanel" ng-class="{\'ui-widget-header\':jqueryUITheme, \'ui-corner-top\': jqueryUITheme}" ng-style="topPanelStyle()"><div class="ngGroupPanel" ng-show="showGroupPanel()" ng-style="headerStyle()"><div class="ngGroupPanelDescription" ng-show="configGroups.length == 0">{{i18n.ngGroupPanelDescription}}</div><ul ng-show="configGroups.length > 0" class="ngGroupList"><li class="ngGroupItem" ng-repeat="group in configGroups"><span class="ngGroupElement"><span class="ngGroupName">{{group.displayName}}<span ng-click="removeGroup($index)" class="ngRemoveGroup">x</span></span><span ng-hide="$last" class="ngGroupArrow"></span></span></li></ul></div><div class="ngHeaderContainer" ng-style="headerStyle()"><div class="ngHeaderScroller" ng-style="headerScrollerStyle()" ng-header-row></div></div><div class="ngHeaderButton" ng-show="showColumnMenu || showFilter" ng-click="toggleShowMenu()"><div class="ngHeaderButtonArrow" ng-click=""></div></div><div ng-show="showMenu" class="ngColMenu"><div ng-show="showFilter"><input placeholder="{{i18n.ngSearchPlaceHolder}}" type="text" ng-model="filterText"/></div><div ng-show="showColumnMenu"><span class="ngMenuText">{{i18n.ngMenuText}}</span><ul class="ngColList"><li class="ngColListItem" ng-repeat="col in columns | ngColumns"><label><input type="checkbox" class="ngColListCheckbox" ng-model="col.visible"/>{{col.displayName}}</label><a title="Group By" ng-class="col.groupedByClass()" ng-show="col.groupable && col.visible" ng-click="groupBy(col)"></a><span class="ngGroupingNumber" ng-show="col.groupIndex > 0">{{col.groupIndex}}</span></li></ul></div></div></div><div class="ngViewport" unselectable="on" ng-viewport ng-class="{\'ui-widget-content\': jqueryUITheme}" ng-style="viewportStyle()"><div class="ngCanvas" ng-style="canvasStyle()"><div ng-style="rowStyle(row)" ng-repeat="row in renderedRows" ng-click="row.toggleSelected($event)" class="ngRow" ng-class="row.alternatingRowClass()" ng-row></div></div></div><div class="ngFooterPanel" ng-class="{\'ui-widget-content\': jqueryUITheme, \'ui-corner-bottom\': jqueryUITheme}" ng-style="footerStyle()"><div class="ngTotalSelectContainer" ng-show="footerVisible"><div class="ngFooterTotalItems" ng-class="{\'ngNoMultiSelect\': !multiSelect}" ><span class="ngLabel">{{i18n.ngTotalItemsLabel}} {{maxRows()}}</span><span ng-show="filterText.length > 0" class="ngLabel">({{i18n.ngShowingItemsLabel}} {{totalFilteredItemsLength()}})</span></div><div class="ngFooterSelectedItems" ng-show="multiSelect"><span class="ngLabel">{{i18n.ngSelectedItemsLabel}} {{selectedItems.length}}</span></div></div><div class="ngPagerContainer" style="float: right; margin-top: 10px;" ng-show="footerVisible && enablePaging" ng-class="{\'ngNoMultiSelect\': !multiSelect}"><div style="float:left; margin-right: 10px;" class="ngRowCountPicker"><span style="float: left; margin-top: 3px;" class="ngLabel">{{i18n.ngPageSizeLabel}}</span><select style="float: left;height: 27px; width: 100px" ng-model="pagingOptions.pageSize" ><option ng-repeat="size in pagingOptions.pageSizes">{{size}}</option></select></div><div style="float:left; margin-right: 10px; line-height:25px;" class="ngPagerControl" style="float: left; min-width: 135px;"><button class="ngPagerButton" ng-click="pageToFirst()" ng-disabled="cantPageBackward()" title="{{i18n.ngPagerFirstTitle}}"><div class="ngPagerFirstTriangle"><div class="ngPagerFirstBar"></div></div></button><button class="ngPagerButton" ng-click="pageBackward()" ng-disabled="cantPageBackward()" title="{{i18n.ngPagerPrevTitle}}"><div class="ngPagerFirstTriangle ngPagerPrevTriangle"></div></button><input class="ngPagerCurrent" type="text" style="width:50px; height: 24px; margin-top: 1px; padding: 0px 4px;" ng-model="pagingOptions.currentPage"/><button class="ngPagerButton" ng-click="pageForward()" ng-disabled="cantPageForward()" title="{{i18n.ngPagerNextTitle}}"><div class="ngPagerLastTriangle ngPagerNextTriangle"></div></button><button class="ngPagerButton" ng-click="pageToLast()" ng-disabled="cantPageToLast()" title="{{i18n.ngPagerLastTitle}}"><div class="ngPagerLastTriangle"><div class="ngPagerLastBar"></div></div></button></div></div></div>'; }; ng.defaultRowTemplate = function () { return '<div ng-style="{\'cursor\': row.cursor}" ng-repeat="col in visibleColumns()" class="ngCell col{{$index}} {{col.cellClass}}" ng-cell></div>'; }; ng.defaultCellTemplate = function () { return '<div class="ngCellText colt{{$index}}"><span ng-cell-text>{{COL_FIELD CUSTOM_FILTERS}}</span></div>'; }; ng.aggregateTemplate = function () { return '<div ng-click="row.toggleExpand()" ng-style="{\'left\': row.offsetleft}" class="ngAggregate"><span class="ngAggregateText">{{row.label CUSTOM_FILTERS}} ({{row.totalChildren()}} {{AggItemsLabel}})</span><div class="{{row.aggClass()}}"></div></div>'; }; ng.defaultHeaderRowTemplate = function () { return '<div ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell></div>'; }; ng.defaultHeaderCellTemplate = function () { return '<div ng-click="col.sort()" class="ngHeaderSortColumn {{col.headerClass}}" ng-style="{\'cursor\': col.cursor}" ng-class="{ \'ngSorted\': !noSortVisible }"><div class="ngHeaderText colt{{$index}}">{{col.displayName}}</div><div class="ngSortButtonDown" ng-show="col.showSortButtonDown()"></div><div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div></div><div ng-show="col.resizable" class="ngHeaderGrip" ng-click="col.gripClick($event)" ng-mousedown="col.gripOnMouseDown($event)"></div>'; }; ng.Aggregate = function (aggEntity, rowFactory) { var self = this; self.index = 0; self.offsetTop = 0; self.entity = aggEntity; self.label = aggEntity.gLabel; self.field = aggEntity.gField; self.depth = aggEntity.gDepth; self.parent = aggEntity.parent; self.children = aggEntity.children; self.aggChildren = aggEntity.aggChildren; self.aggIndex = aggEntity.aggIndex; self.collapsed = true; self.isAggRow = true; self.offsetleft = aggEntity.gDepth * 25; self.aggLabelFilter = aggEntity.aggLabelFilter; self.toggleExpand = function () { self.collapsed = self.collapsed ? false : true; self.notifyChildren(); }; self.setExpand = function (state) { self.collapsed = state; self.notifyChildren(); }; self.notifyChildren = function () { angular.forEach(self.aggChildren, function (child) { child.entity[NG_HIDDEN] = self.collapsed; if (self.collapsed) { child.setExpand(self.collapsed); } }); angular.forEach(self.children, function (child) { child[NG_HIDDEN] = self.collapsed; }); rowFactory.rowCache = []; var foundMyself = false; angular.forEach(rowFactory.aggCache, function (agg, i) { if (foundMyself) { var offset = (30 * self.children.length); agg.offsetTop = self.collapsed ? agg.offsetTop - offset : agg.offsetTop + offset; } else { if (i == self.aggIndex) { foundMyself = true; } } }); rowFactory.renderedChange(); }; self.aggClass = function () { return self.collapsed ? "ngAggArrowCollapsed" : "ngAggArrowExpanded"; }; self.totalChildren = function () { if (self.aggChildren.length > 0) { var i = 0; var recurse = function (cur) { if (cur.aggChildren.length > 0) { angular.forEach(cur.aggChildren, function (a) { recurse(a); }); } else { i += cur.children.length; } }; recurse(self); return i; } else { return self.children.length; } }; }; ng.EventProvider = function (grid, $scope, domUtilityService) {
        var self = this; self.colToMove = undefined; self.groupToMove = undefined; self.assignEvents = function () {
            if (grid.config.jqueryUIDraggable) { grid.$groupPanel.droppable({ addClasses: false, drop: function (event) { self.onGroupDrop(event); } }); $scope.$evalAsync(self.setDraggables); } else {
                grid.$groupPanel.on('mousedown', self.onGroupMouseDown).on('dragover', self.dragOver).on('drop', self.onGroupDrop); grid.$headerScroller.on('mousedown', self.onHeaderMouseDown).on('dragover', self.dragOver); if (grid.config.enableColumnReordering) { grid.$headerScroller.on('drop', self.onHeaderDrop); }
                if (grid.config.enableRowReordering) { grid.$viewport.on('mousedown', self.onRowMouseDown).on('dragover', self.dragOver).on('drop', self.onRowDrop); }
            }
            $scope.$watch('columns', self.setDraggables, true);
        }; self.dragStart = function (evt) { evt.dataTransfer.setData('text', ''); }; self.dragOver = function (evt) { evt.preventDefault(); }; self.setDraggables = function () { if (!grid.config.jqueryUIDraggable) { var columns = grid.$root.find('.ngHeaderSortColumn'); angular.forEach(columns, function (col) { col.setAttribute('draggable', 'true'); col.addEventListener('dragstart', self.dragStart); }); if (navigator.userAgent.indexOf("MSIE") != -1) { grid.$root.find('.ngHeaderSortColumn').bind('selectstart', function () { this.dragDrop(); return false; }); } } else { grid.$root.find('.ngHeaderSortColumn').draggable({ helper: 'clone', appendTo: 'body', stack: 'div', addClasses: false, start: function (event) { self.onHeaderMouseDown(event); } }).droppable({ drop: function (event) { self.onHeaderDrop(event); } }); } }; self.onGroupMouseDown = function (event) {
            var groupItem = $(event.target); if (groupItem[0].className != 'ngRemoveGroup') {
                var groupItemScope = angular.element(groupItem).scope(); if (groupItemScope) {
                    if (!grid.config.jqueryUIDraggable) { groupItem.attr('draggable', 'true'); this.addEventListener('dragstart', self.dragStart); if (navigator.userAgent.indexOf("MSIE") != -1) { groupItem.bind('selectstart', function () { this.dragDrop(); return false; }); } }
                    self.groupToMove = { header: groupItem, groupName: groupItemScope.group, index: groupItemScope.$index };
                }
            } else { self.groupToMove = undefined; }
        }; self.onGroupDrop = function (event) {
            event.stopPropagation(); var groupContainer; var groupScope; if (self.groupToMove) {
                groupContainer = $(event.target).closest('.ngGroupElement'); if (groupContainer.context.className == 'ngGroupPanel') { $scope.configGroups.splice(self.groupToMove.index, 1); $scope.configGroups.push(self.groupToMove.groupName); } else { groupScope = angular.element(groupContainer).scope(); if (groupScope) { if (self.groupToMove.index != groupScope.$index) { $scope.configGroups.splice(self.groupToMove.index, 1); $scope.configGroups.splice(groupScope.$index, 0, self.groupToMove.groupName); } } }
                self.groupToMove = undefined; grid.fixGroupIndexes();
            } else if (self.colToMove) {
                if ($scope.configGroups.indexOf(self.colToMove.col) == -1) { groupContainer = $(event.target).closest('.ngGroupElement'); if (groupContainer.context.className == 'ngGroupPanel' || groupContainer.context.className == 'ngGroupPanelDescription ng-binding') { $scope.groupBy(self.colToMove.col); } else { groupScope = angular.element(groupContainer).scope(); if (groupScope) { $scope.removeGroup(groupScope.$index); } } }
                self.colToMove = undefined;
            }
            if (!$scope.$$phase) { $scope.$apply(); }
        }; self.onHeaderMouseDown = function (event) { var headerContainer = $(event.target).closest('.ngHeaderSortColumn'); var headerScope = angular.element(headerContainer).scope(); if (headerScope) { self.colToMove = { header: headerContainer, col: headerScope.col }; } }; self.onHeaderDrop = function (event) {
            if (!self.colToMove) { return; }
            var headerContainer = $(event.target).closest('.ngHeaderSortColumn'); var headerScope = angular.element(headerContainer).scope(); if (headerScope) {
                if (self.colToMove.col == headerScope.col) { return; }
                $scope.columns.splice(self.colToMove.col.index, 1); $scope.columns.splice(headerScope.col.index, 0, self.colToMove.col); grid.fixColumnIndexes(); domUtilityService.BuildStyles($scope, grid, true); self.colToMove = undefined;
            }
        }; self.onRowMouseDown = function (event) { var targetRow = $(event.target).closest('.ngRow'); var rowScope = angular.element(targetRow).scope(); if (rowScope) { targetRow.attr('draggable', 'true'); domUtilityService.eventStorage.rowToMove = { targetRow: targetRow, scope: rowScope }; } }; self.onRowDrop = function (event) {
            var targetRow = $(event.target).closest('.ngRow'); var rowScope = angular.element(targetRow).scope(); if (rowScope) {
                var prevRow = domUtilityService.eventStorage.rowToMove; if (prevRow.scope.row == rowScope.row) { return; }
                var i = grid.sortedData.indexOf(prevRow.scope.row.entity); var j = grid.sortedData.indexOf(rowScope.row.entity); grid.sortedData.splice(i, 1); grid.sortedData.splice(j, 0, prevRow.scope.row.entity); grid.searchProvider.evalFilter(); domUtilityService.eventStorage.rowToMove = undefined;
            }
        }; self.assignGridEventHandlers = function () {
            if (grid.config.tabIndex === -1) { grid.$viewport.attr('tabIndex', domUtilityService.numberOfGrids); domUtilityService.numberOfGrids++; } else { grid.$viewport.attr('tabIndex', grid.config.tabIndex); }
            $(window).resize(function () { domUtilityService.RebuildGrid($scope, grid); });
        }; self.assignGridEventHandlers(); self.assignEvents();
    }; ng.Column = function (config, $scope, grid, domUtilityService) {
        var self = this, colDef = config.colDef, delay = 500, clicks = 0, timer = null; self.width = colDef.width; self.groupIndex = 0; self.isGroupedBy = false; self.minWidth = !colDef.minWidth ? 50 : colDef.minWidth; self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth; self.headerRowHeight = config.headerRowHeight; self.displayName = colDef.displayName || colDef.field; self.index = config.index; self.isAggCol = config.isAggCol; self.cellClass = colDef.cellClass; self.cellFilter = colDef.cellFilter ? colDef.cellFilter : ""; self.field = colDef.field; self.aggLabelFilter = colDef.cellFilter || colDef.aggLabelFilter; self.visible = ng.utils.isNullOrUndefined(colDef.visible) || colDef.visible; self.sortable = false; self.resizable = false; self.groupable = ng.utils.isNullOrUndefined(colDef.groupable) || colDef.sortable; if (config.enableSort) { self.sortable = ng.utils.isNullOrUndefined(colDef.sortable) || colDef.sortable; }
        if (config.enableResize) { self.resizable = ng.utils.isNullOrUndefined(colDef.resizable) || colDef.resizable; }
        self.sortDirection = undefined; self.sortingAlgorithm = colDef.sortFn; self.headerClass = colDef.headerClass; self.headerCellTemplate = colDef.headerCellTemplate || ng.defaultHeaderCellTemplate(); self.cursor = self.sortable ? 'pointer' : 'default'; self.cellTemplate = colDef.cellTemplate || ng.defaultCellTemplate().replace(CUSTOM_FILTERS, self.cellFilter ? "|" + self.cellFilter : ""); if (colDef.cellTemplate && !TEMPLATE_REGEXP.test(colDef.cellTemplate)) { self.cellTemplate = $.ajax({ type: "GET", url: colDef.cellTemplate, async: false }).responseText; }
        if (colDef.headerCellTemplate && !TEMPLATE_REGEXP.test(colDef.headerCellTemplate)) { self.headerCellTemplate = $.ajax({ type: "GET", url: colDef.headerCellTemplate, async: false }).responseText; }
        self.groupedByClass = function () { return self.isGroupedBy ? "ngGroupedByIcon" : "ngGroupIcon"; }; self.toggleVisible = function () { self.visible = !self.visible; }; self.showSortButtonUp = function () { return self.sortable ? self.sortDirection === DESC : self.sortable; }; self.showSortButtonDown = function () { return self.sortable ? self.sortDirection === ASC : self.sortable; }; self.noSortVisible = function () { return !self.sortDirection; }; self.sort = function () {
            if (!self.sortable) { return true; }
            var dir = self.sortDirection === ASC ? DESC : ASC; self.sortDirection = dir; config.sortCallback(self); return false;
        }; self.gripClick = function () { clicks++; if (clicks === 1) { timer = setTimeout(function () { clicks = 0; }, delay); } else { clearTimeout(timer); config.resizeOnDataCallback(self); clicks = 0; } }; self.gripOnMouseDown = function (event) {
            if (event.ctrlKey) { self.toggleVisible(); domUtilityService.BuildStyles($scope, grid); return true; }
            event.target.parentElement.style.cursor = 'col-resize'; self.startMousePosition = event.clientX; self.origWidth = self.width; $(document).mousemove(self.onMouseMove); $(document).mouseup(self.gripOnMouseUp); return false;
        }; self.onMouseMove = function (event) { var diff = event.clientX - self.startMousePosition; var newWidth = diff + self.origWidth; self.width = (newWidth < self.minWidth ? self.minWidth : (newWidth > self.maxWidth ? self.maxWidth : newWidth)); domUtilityService.BuildStyles($scope, grid); return false; }; self.gripOnMouseUp = function () { $(document).off('mousemove'); $(document).off('mouseup'); event.target.parentElement.style.cursor = 'default'; domUtilityService.digest($scope); return false; };
    }; ng.Dimension = function (options) { this.outerHeight = null; this.outerWidth = null; $.extend(this, options); }; ng.Footer = function ($scope, grid) { $scope.maxRows = function () { var ret = Math.max($scope.pagingOptions.totalServerItems, grid.sortedData.length); return ret; }; $scope.multiSelect = (grid.config.canSelectRows && grid.config.multiSelect); $scope.selectedItemCount = grid.selectedItemCount; $scope.maxPages = function () { return Math.ceil($scope.maxRows() / $scope.pagingOptions.pageSize); }; $scope.pageForward = function () { var page = $scope.pagingOptions.currentPage; if ($scope.pagingOptions.totalServerItems > 0) { $scope.pagingOptions.currentPage = Math.min(page + 1, $scope.maxPages()); } else { $scope.pagingOptions.currentPage++; } }; $scope.pageBackward = function () { var page = $scope.pagingOptions.currentPage; $scope.pagingOptions.currentPage = Math.max(page - 1, 1); }; $scope.pageToFirst = function () { $scope.pagingOptions.currentPage = 1; }; $scope.pageToLast = function () { var maxPages = $scope.maxPages(); $scope.pagingOptions.currentPage = maxPages; }; $scope.cantPageForward = function () { var curPage = $scope.pagingOptions.currentPage; var maxPages = $scope.maxPages(); if ($scope.pagingOptions.totalServerItems > 0) { return !(curPage < maxPages); } else { return grid.sortedData.length < 1; } }; $scope.cantPageToLast = function () { if ($scope.pagingOptions.totalServerItems > 0) { return $scope.cantPageForward(); } else { return true; } }; $scope.cantPageBackward = function () { var curPage = $scope.pagingOptions.currentPage; return !(curPage > 1); }; }; ng.RowFactory = function (grid, $scope) {
        var self = this; self.rowCache = []; self.aggCache = {}; self.parentCache = []; self.dataChanged = true; self.parsedData = []; self.rowConfig = {}; self.selectionService = $scope.selectionService; self.rowHeight = 30; self.numberOfAggregates = 0; self.groupedData = undefined; self.rowHeight = grid.config.rowHeight; self.rowConfig = { canSelectRows: grid.config.canSelectRows, rowClasses: grid.config.rowClasses, selectedItems: $scope.selectedItems, selectWithCheckboxOnly: grid.config.selectWithCheckboxOnly, beforeSelectionChangeCallback: grid.config.beforeSelectionChange, afterSelectionChangeCallback: grid.config.afterSelectionChange, jqueryUITheme: grid.config.jqueryUITheme }; self.renderedRange = new ng.Range(0, grid.minRowsToRender() + EXCESS_ROWS); self.buildEntityRow = function (entity, rowIndex) {
            var row = self.rowCache[rowIndex]; if (!row) { row = new ng.Row(entity, self.rowConfig, self.selectionService); row.rowIndex = rowIndex + 1; row.offsetTop = self.rowHeight * rowIndex; self.rowCache[rowIndex] = row; }
            return row;
        }; self.buildAggregateRow = function (aggEntity, rowIndex) {
            var agg = self.aggCache[aggEntity.aggIndex]; if (!agg) { agg = new ng.Aggregate(aggEntity, self); self.aggCache[aggEntity.aggIndex] = agg; }
            agg.index = rowIndex + 1; agg.offsetTop = self.rowHeight * rowIndex; return agg;
        }; self.UpdateViewableRange = function (newRange) { self.renderedRange = newRange; self.renderedChange(); }; self.filteredDataChanged = function () {
            if (grid.lateBoundColumns && grid.filteredData.length > 0) { grid.config.columnDefs = undefined; grid.buildColumns(); grid.lateBoundColumns = false; }
            self.dataChanged = true; self.rowCache = []; if (grid.config.groups.length > 0) { self.getGrouping(grid.config.groups); }
            self.UpdateViewableRange(self.renderedRange);
        }; self.renderedChange = function () {
            if (!self.groupedData || grid.config.groups.length < 1) { self.renderedChangeNoGroups(); grid.refreshDomSizes(); return; }
            self.parentCache = []; var rowArr = []; var dataArray = self.parsedData.filter(function (e) { return e[NG_HIDDEN] === false; }).slice(self.renderedRange.topRow, self.renderedRange.bottomRow); angular.forEach(dataArray, function (item, indx) {
                var row; if (item.isAggRow) { row = self.buildAggregateRow(item, self.renderedRange.topRow + indx); } else { row = self.buildEntityRow(item, self.renderedRange.topRow + indx); }
                rowArr.push(row);
            }); grid.setRenderedRows(rowArr);
        }; self.renderedChangeNoGroups = function () { var rowArr = []; var dataArr = grid.filteredData.slice(self.renderedRange.topRow, self.renderedRange.bottomRow); angular.forEach(dataArr, function (item, i) { var row = self.buildEntityRow(item, self.renderedRange.topRow + i); rowArr.push(row); }); grid.setRenderedRows(rowArr); }; self.parseGroupData = function (g) {
            if (g.values) { angular.forEach(g.values, function (item) { self.parentCache[self.parentCache.length - 1].children.push(item); self.parsedData.push(item); }); } else {
                for (var prop in g) {
                    if (prop == NG_FIELD || prop == NG_DEPTH || prop == NG_COLUMN) { continue; } else if (g.hasOwnProperty(prop)) {
                        var agg = self.buildAggregateRow({ gField: g[NG_FIELD], gLabel: prop, gDepth: g[NG_DEPTH], isAggRow: true, '_ng_hidden_': false, children: [], aggChildren: [], aggIndex: self.numberOfAggregates, aggLabelFilter: g[NG_COLUMN].aggLabelFilter }, 0); self.numberOfAggregates++; agg.parent = self.parentCache[agg.depth - 1]; if (agg.parent) { agg.parent.collapsed = false; agg.parent.aggChildren.push(agg); }
                        self.parsedData.push(agg.entity); self.parentCache[agg.depth] = agg; self.parseGroupData(g[prop]);
                    }
                }
            }
        }; self.getGrouping = function (groups) {
            self.aggCache = []; self.rowCache = []; self.numberOfAggregates = 0; self.groupedData = {}; var data = grid.filteredData; var maxDepth = groups.length; var cols = $scope.columns; angular.forEach(data, function (item) {
                item[NG_HIDDEN] = true; var ptr = self.groupedData; angular.forEach(groups, function (group, depth) {
                    var col = cols.filter(function (c) { return c.field == group; })[0]; var val = ng.utils.evalProperty(item, group); val = val ? val.toString() : 'null'; if (!ptr[val]) { ptr[val] = {}; }
                    if (!ptr[NG_FIELD]) { ptr[NG_FIELD] = group; }
                    if (!ptr[NG_DEPTH]) { ptr[NG_DEPTH] = depth; }
                    if (!ptr[NG_COLUMN]) { ptr[NG_COLUMN] = col; }
                    ptr = ptr[val];
                }); if (!ptr.values) { ptr.values = []; }
                ptr.values.push(item);
            }); angular.forEach(groups, function (group, depth) { if (!cols[depth].isAggCol && depth <= maxDepth) { cols.splice(0, 0, new ng.Column({ colDef: { field: '', width: 25, sortable: false, resizable: false, headerCellTemplate: '<div class="ngAggHeader"></div>' }, isAggCol: true, headerRowHeight: grid.config.headerRowHeight })); } }); grid.fixColumnIndexes(); self.parsedData.length = 0; self.parseGroupData(self.groupedData);
        }; if (grid.config.groups.length > 0 && grid.filteredData.length > 0) { self.getGrouping(grid.config.groups); }
    }; ng.Grid = function ($scope, options, sortService, domUtilityService, $filter) {
        var defaults = { afterSelectionChange: function () { }, beforeSelectionChange: function () { return true; }, canSelectRows: true, columnDefs: undefined, data: [], displaySelectionCheckbox: true, enableColumnResize: true, enableColumnReordering: true, enablePaging: false, enableRowReordering: true, enableSorting: true, filterOptions: { filterText: "", useExternalFilter: false }, footerRowHeight: 55, displayFooter: undefined, footerVisible: true, groups: [], headerRowHeight: 30, headerRowTemplate: undefined, jqueryUIDraggable: false, jqueryUITheme: false, keepLastSelected: true, maintainColumnRatios: undefined, multiSelect: true, pagingOptions: { pageSizes: [250, 500, 1000], pageSize: 250, totalServerItems: 0, currentPage: 1 }, plugins: [], rowHeight: 30, rowTemplate: undefined, selectedItems: [], selectWithCheckboxOnly: false, showColumnMenu: true, showFilter: true, showGroupPanel: false, sortInfo: undefined, tabIndex: -1, useExternalSorting: false, i18n: 'en' }, self = this; self.maxCanvasHt = 0; self.config = $.extend(defaults, options); if (typeof options.columnDefs == "string") { self.config.columnDefs = $scope.$eval(options.columnDefs); }
        self.gridId = "ng" + ng.utils.newId(); self.$root = null; self.$groupPanel = null; self.$topPanel = null; self.$headerContainer = null; self.$headerScroller = null; self.$headers = null; self.$viewport = null; self.$canvas = null; self.rootDim = self.config.gridDim; self.sortInfo = self.config.sortInfo; self.sortedData = []; self.lateBindColumns = false; self.filteredData = []; if (typeof self.config.data == "object") { self.sortedData = self.config.data; }
        self.lastSortedColumn = undefined; self.calcMaxCanvasHeight = function () { return (self.config.groups.length > 0) ? (self.rowFactory.parsedData.filter(function (e) { return e[NG_HIDDEN] === false; }).length * self.config.rowHeight) : (self.filteredData.length * self.config.rowHeight); }; self.elementDims = { scrollW: 0, scrollH: 0, rowIndexCellW: 25, rowSelectedCellW: 25, rootMaxW: 0, rootMaxH: 0 }; self.setRenderedRows = function (newRows) {
            $scope.renderedRows = newRows; if (!$scope.$$phase) { $scope.$digest(); }
            self.refreshDomSizes(); $scope.$emit('ngGridEventRows', newRows);
        }; self.minRowsToRender = function () { var viewportH = $scope.viewportDimHeight() || 1; return Math.floor(viewportH / self.config.rowHeight); }; self.refreshDomSizes = function () { var dim = new ng.Dimension(); dim.outerWidth = self.elementDims.rootMaxW; dim.outerHeight = self.elementDims.rootMaxH; self.rootDim = dim; self.maxCanvasHt = self.calcMaxCanvasHeight(); }; self.buildColumnDefsFromData = function () {
            if (!self.config.columnDefs) { self.config.columnDefs = []; }
            if (!self.sortedData || !self.sortedData[0]) { self.lateBoundColumns = true; return; }
            var item; item = self.sortedData[0]; ng.utils.forIn(item, function (prop, propName) { if (propName != SELECTED_PROP) { self.config.columnDefs.push({ field: propName }); } });
        }; self.buildColumns = function () {
            var columnDefs = self.config.columnDefs, cols = []; var indexOffset = self.config.displaySelectionCheckbox ? self.config.groups.length + 1 : self.config.groups.length; if (!columnDefs) { self.buildColumnDefsFromData(); columnDefs = self.config.columnDefs; }
            if (self.config.displaySelectionCheckbox) { cols.push(new ng.Column({ colDef: { field: '\u2714', width: self.elementDims.rowSelectedCellW, sortable: false, resizable: false, groupable: false, headerCellTemplate: '<input class="ngSelectionHeader" type="checkbox" ng-show="multiSelect" ng-model="allSelected" ng-change="toggleSelectAll(allSelected)"/>', cellTemplate: '<div class="ngSelectionCell"><input class="ngSelectionCheckbox" type="checkbox" ng-checked="row.selected" /></div>' }, index: 0, headerRowHeight: self.config.headerRowHeight, sortCallback: self.sortData, resizeOnDataCallback: self.resizeOnData, enableResize: self.config.enableColumnResize, enableSort: self.config.enableSorting }, $scope, self, domUtilityService, $filter)); }
            if (columnDefs.length > 0) {
                $scope.configGroups.length = 0; angular.forEach(columnDefs, function (colDef, i) {
                    i += indexOffset; var column = new ng.Column({ colDef: colDef, index: i, headerRowHeight: self.config.headerRowHeight, sortCallback: self.sortData, resizeOnDataCallback: self.resizeOnData, enableResize: self.config.enableColumnResize, enableSort: self.config.enableSorting }, $scope, self, domUtilityService); var indx = self.config.groups.indexOf(colDef.field); if (indx != -1) { column.isGroupedBy = true; $scope.configGroups.splice(indx, 0, column); column.groupIndex = $scope.configGroups.length; }
                    cols.push(column);
                }); $scope.columns = cols;
            }
        }; self.configureColumnWidths = function () {
            var cols = self.config.columnDefs; var indexOffset = self.config.displaySelectionCheckbox ? $scope.configGroups.length + 1 : $scope.configGroups.length; var numOfCols = cols.length + indexOffset, asterisksArray = [], percentArray = [], asteriskNum = 0, totalWidth = 0; totalWidth += self.config.displaySelectionCheckbox ? 25 : 0; angular.forEach(cols, function (col, i) {
                i += indexOffset; var isPercent = false, t = undefined; if (ng.utils.isNullOrUndefined(col.width)) { col.width = "*"; } else { isPercent = isNaN(col.width) ? ng.utils.endsWith(col.width, "%") : false; t = isPercent ? col.width : parseInt(col.width, 10); }
                if (isNaN(t)) { t = col.width; if (t == 'auto') { $scope.columns[i].width = col.minWidth; totalWidth += $scope.columns[i].width; var temp = $scope.columns[i]; $scope.$evalAsync(function () { self.resizeOnData(temp, true); }); return; } else if (t.indexOf("*") != -1) { asteriskNum += t.length; col.index = i; asterisksArray.push(col); return; } else if (isPercent) { col.index = i; percentArray.push(col); return; } else { throw "unable to parse column width, use percentage (\"10%\",\"20%\", etc...) or \"*\" to use remaining width of grid"; } } else { totalWidth += $scope.columns[i].width = parseInt(col.width, 10); }
            }); if (asterisksArray.length > 0) {
                self.config.maintainColumnRatios === false ? angular.noop() : self.config.maintainColumnRatios = true; var remainigWidth = self.rootDim.outerWidth - totalWidth; var asteriskVal = Math.floor(remainigWidth / asteriskNum); angular.forEach(asterisksArray, function (col) {
                    var t = col.width.length; $scope.columns[col.index].width = asteriskVal * t; if (col.index + 1 == numOfCols) {
                        var offset = 2; if (self.maxCanvasHt > $scope.viewportDimHeight()) { offset += domUtilityService.ScrollW; }
                        $scope.columns[col.index].width -= offset;
                    }
                    totalWidth += $scope.columns[col.index].width;
                });
            }
            if (percentArray.length > 0) { angular.forEach(percentArray, function (col) { var t = col.width; $scope.columns[col.index].width = Math.floor(self.rootDim.outerWidth * (parseInt(t.slice(0, -1), 10) / 100)); }); }
        }; self.init = function () { $scope.selectionService = new ng.SelectionService(self); self.rowFactory = new ng.RowFactory(self, $scope); $scope.selectionService.Initialize(self.rowFactory); self.searchProvider = new ng.SearchProvider($scope, self, $filter); self.styleProvider = new ng.StyleProvider($scope, self, domUtilityService); $scope.$watch('configGroups', function (a) { var tempArr = []; angular.forEach(a, function (item) { tempArr.push(item.field || item); }); self.config.groups = tempArr; self.rowFactory.filteredDataChanged(); $scope.$emit('ngGridEventGroups', a); }, true); $scope.$watch('columns', function (a) { domUtilityService.BuildStyles($scope, self, true); $scope.$emit('ngGridEventColumns', a); }, true); $scope.$watch(function () { return options.i18n; }, function (newLang) { ng.utils.seti18n($scope, newLang); }); self.maxCanvasHt = self.calcMaxCanvasHeight(); if (self.config.sortInfo) { self.config.sortInfo.column = $scope.columns.filter(function (c) { return c.field == self.config.sortInfo.field; })[0]; self.config.sortInfo.column.sortDirection = self.config.sortInfo.direction.toUpperCase(); self.sortData(self.config.sortInfo.column); } }; self.prevScrollTop = 0; self.prevScrollIndex = 0; self.resizeOnData = function (col) {
            var longest = col.minWidth; var arr = ng.utils.getElementsByClassName('col' + col.index); angular.forEach(arr, function (elem, index) {
                var i; if (index === 0) { var kgHeaderText = $(elem).find('.ngHeaderText'); i = ng.utils.visualLength(kgHeaderText) + 10; } else { var ngCellText = $(elem).find('.ngCellText'); i = ng.utils.visualLength(ngCellText) + 10; }
                if (i > longest) { longest = i; }
            }); col.width = col.longest = Math.min(col.maxWidth, longest + 7); domUtilityService.BuildStyles($scope, self, true);
        }; self.sortData = function (col) {
            if (self.config.sortInfo) { self.config.sortInfo.column = col; self.config.sortInfo.field = col.field; self.config.sortInfo.direction = col.sortDirection; } else { self.config.sortInfo = { column: col, field: col.field, direction: col.sortDirection }; }
            self.clearSortingData(col); if (!self.config.useExternalSorting) { sortService.Sort(self.config.sortInfo, self.sortedData); }
            self.lastSortedColumn = col; self.searchProvider.evalFilter(); $scope.$emit('ngGridEventSorted', col);
        }; self.clearSortingData = function (col) { if (!col) { angular.forEach($scope.columns, function (c) { c.sortDirection = ""; }); } else if (self.lastSortedColumn && col != self.lastSortedColumn) { self.lastSortedColumn.sortDirection = ""; } }; self.fixColumnIndexes = function () { angular.forEach($scope.columns, function (col, i) { col.index = i; }); }; self.fixGroupIndexes = function () { angular.forEach($scope.configGroups, function (item, i) { item.groupIndex = i + 1; }); }; $scope.elementsNeedMeasuring = true; $scope.columns = []; $scope.renderedRows = []; $scope.headerRow = null; $scope.rowHeight = self.config.rowHeight; $scope.jqueryUITheme = self.config.jqueryUITheme; $scope.footer = null; $scope.selectedItems = self.config.selectedItems; $scope.multiSelect = self.config.multiSelect; $scope.footerVisible = ng.utils.isNullOrUndefined(self.config.displayFooter) ? self.config.footerVisible : self.config.displayFooter; $scope.footerRowHeight = $scope.footerVisible ? self.config.footerRowHeight : 0; $scope.showColumnMenu = self.config.showColumnMenu; $scope.showMenu = false; $scope.configGroups = []; $scope.enablePaging = self.config.enablePaging; $scope.pagingOptions = self.config.pagingOptions; $scope.rowTemplate = self.config.rowTemplate || ng.defaultRowTemplate(); $scope.headerRowTemplate = self.config.headerRowTemplate || ng.defaultHeaderRowTemplate(); $scope.i18n = {}; ng.utils.seti18n($scope, self.config.i18n); $scope.adjustScrollLeft = function (scrollLeft) { if (self.$headerContainer) { self.$headerContainer.scrollLeft(scrollLeft); } }; $scope.adjustScrollTop = function (scrollTop, force) {
            if (self.prevScrollTop === scrollTop && !force) { return; }
            var rowIndex = Math.floor(scrollTop / self.config.rowHeight); if (self.prevScrollTop < scrollTop && rowIndex < self.prevScrollIndex + SCROLL_THRESHOLD) { return; }
            if (self.prevScrollTop > scrollTop && rowIndex > self.prevScrollIndex - SCROLL_THRESHOLD) { return; }
            self.prevScrollTop = scrollTop; self.rowFactory.UpdateViewableRange(new ng.Range(Math.max(0, rowIndex - EXCESS_ROWS), rowIndex + self.minRowsToRender() + EXCESS_ROWS)); self.prevScrollIndex = rowIndex;
        }; if (self.config.rowTemplate && !TEMPLATE_REGEXP.test(self.config.rowTemplate)) { $scope.rowTemplate = $.ajax({ type: "GET", url: self.config.rowTemplate, async: false }).responseText; }
        if (self.config.headerRowTemplate && !TEMPLATE_REGEXP.test(self.config.headerRowTemplate)) { $scope.headerRowTemplate = $.ajax({ type: "GET", url: self.config.headerRowTemplate, async: false }).responseText; }
        $scope.visibleColumns = function () { return $scope.columns.filter(function (col) { return col.visible; }); }; $scope.toggleShowMenu = function () { $scope.showMenu = !$scope.showMenu; }; $scope.toggleSelectAll = function (a) { $scope.selectionService.toggleSelectAll(a); }; $scope.totalFilteredItemsLength = function () { return self.filteredData.length; }; $scope.showGroupPanel = function () { return self.config.showGroupPanel; }; $scope.topPanelHeight = function () { return self.config.showGroupPanel === true ? self.config.headerRowHeight * 2 : self.config.headerRowHeight; }; $scope.viewportDimHeight = function () { return Math.max(0, self.rootDim.outerHeight - $scope.topPanelHeight() - $scope.footerRowHeight - 2); }; $scope.groupBy = function (col) {
            if (self.sortedData.length < 1 || !col.groupable || !col.field) { return; }
            var indx = $scope.configGroups.indexOf(col); if (indx == -1) { col.isGroupedBy = true; $scope.configGroups.push(col); col.groupIndex = $scope.configGroups.length; } else { $scope.removeGroup(indx); }
        }; $scope.removeGroup = function (index) {
            var col = $scope.columns.filter(function (item) { return item.groupIndex == (index + 1); })[0]; col.isGroupedBy = false; col.groupIndex = 0; if ($scope.columns[index].isAggCol) { $scope.columns.splice(index, 1); $scope.configGroups.splice(index, 1); self.fixGroupIndexes(); }
            if ($scope.configGroups.length === 0) { self.fixColumnIndexes(); domUtilityService.digest($scope); }
        }; $scope.totalRowWidth = function () { var totalWidth = 0, cols = $scope.visibleColumns(); angular.forEach(cols, function (col) { totalWidth += col.width; }); return totalWidth; }; $scope.headerScrollerDim = function () {
            var viewportH = $scope.viewportDimHeight(), maxHeight = self.maxCanvasHt, vScrollBarIsOpen = (maxHeight > viewportH), newDim = new ng.Dimension(); newDim.autoFitHeight = true; newDim.outerWidth = $scope.totalRowWidth(); if (vScrollBarIsOpen) { newDim.outerWidth += self.elementDims.scrollW; } else if ((maxHeight - viewportH) <= self.elementDims.scrollH) { newDim.outerWidth += self.elementDims.scrollW; }
            return newDim;
        }; self.init();
    }; ng.Range = function (top, bottom) { this.topRow = top; this.bottomRow = bottom; }; ng.Row = function (entity, config, selectionService) {
        var self = this, canSelectRows = config.canSelectRows; self.jqueryUITheme = config.jqueryUITheme; self.rowClasses = config.rowClasses; self.entity = entity; self.selectionService = selectionService; self.selected = null; self.cursor = canSelectRows ? 'pointer' : 'default'; self.continueSelection = function (event) { self.selectionService.ChangeSelection(self, event); }; self.toggleSelected = function (event) {
            if (!canSelectRows) { return true; }
            var element = event.target || event; if (element.type == "checkbox" && element.parentElement.className != "ngSelectionCell ng-scope") { return true; }
            if (config.selectWithCheckboxOnly && element.type != "checkbox") { return true; } else { if (self.beforeSelectionChange(self)) { self.continueSelection(event); return self.afterSelectionChange(); } }
            return false;
        }; self.rowIndex = 0; self.offsetTop = 0; self.rowDisplayIndex = 0; self.alternatingRowClass = function () { var isEven = (self.rowIndex % 2) === 0; var classes = { 'selected': self.selected, 'ui-state-default': self.jqueryUITheme && isEven, 'ui-state-active': self.jqueryUITheme && !isEven, 'even': isEven, 'odd': !isEven }; return classes; }; self.beforeSelectionChange = config.beforeSelectionChangeCallback; self.afterSelectionChange = config.afterSelectionChangeCallback; self.getProperty = function (path) { return ng.utils.evalProperty(self.entity, path); }; var selected = self.selectionService.selectedItems.length > 0 && self.selectionService.selectedItems.indexOf(entity) != -1; self.selectionService.setSelection(self, selected);
    }; ng.SearchProvider = function ($scope, grid, $filter) {
        var self = this, searchConditions = []; self.extFilter = grid.config.filterOptions.useExternalFilter; $scope.showFilter = grid.config.showFilter; $scope.filterText = ''; self.fieldMap = {}; self.evalFilter = function () {
            if (searchConditions.length === 0) { grid.filteredData = grid.sortedData; } else {
                grid.filteredData = grid.sortedData.filter(function (item) {
                    for (var i = 0, len = searchConditions.length; i < len; i++) {
                        var condition = searchConditions[i]; if (!condition.column) {
                            for (var prop in item) {
                                if (item.hasOwnProperty(prop)) {
                                    var c = self.fieldMap[prop]; if (!c) continue; var f = (c && c.cellFilter) ? $filter(c.cellFilter) : null; var pVal = item[prop]; if (pVal != null) {
                                        var result; if (typeof f == 'function') { var filterRes = f(typeof pVal === 'object' ? evalObject(pVal, c.field) : pVal).toString(); result = condition.regex.test(filterRes); } else { result = condition.regex.test(typeof pVal === 'object' ? evalObject(pVal, c.field).toString() : pVal.toString()) }
                                        if (pVal && result) { return true; }
                                    }
                                }
                            }
                            return false;
                        }
                        var col = self.fieldMap[condition.columnDisplay]; if (!col) { return false; }
                        var filter = col.cellFilter ? $filter(col.cellFilter) : null; var value = item[condition.column] || item[col.field.split('.')[0]]; if (value == null) return false; var result; if (typeof filter == 'function') { var filterResults = filter(typeof value === 'object' ? evalObject(value, col.field) : value).toString(); result = condition.regex.test(filterResults); } else { result = condition.regex.test(typeof value === 'object' ? evalObject(value, col.field).toString() : value.toString()) }
                        if (!value || !result) { return false; }
                    }
                    return true;
                });
            }
            grid.rowFactory.filteredDataChanged();
        }; var evalObject = function (obj, columnName) {
            if (typeof obj != 'object' || typeof columnName != 'string')
                return obj; var args = columnName.split('.'); var cObj = obj; if (args.length > 1) {
                    for (var i = 1, len = args.length; i < len; i++) {
                        cObj = cObj[args[i]]; if (!cObj)
                            return obj;
                    }
                    return cObj;
                }
            return obj;
        }; var getRegExp = function (str, modifiers) { try { return new RegExp(str, modifiers); } catch (err) { return new RegExp(str.replace(/(\^|\$|\(|\)|\<|\>|\[|\]|\{|\}|\\|\||\.|\*|\+|\?)/g, '\\$1')); } }; var buildSearchConditions = function (a) {
            searchConditions = []; var qStr = ''; if (!(qStr = $.trim(a))) { return; }
            var columnFilters = qStr.split(";"); $.each(columnFilters, function (i, filter) { var args = filter.split(':'); if (args.length > 1) { var columnName = $.trim(args[0]); var columnValue = $.trim(args[1]); if (columnName && columnValue) { searchConditions.push({ column: columnName, columnDisplay: columnName.replace(/\s+/g, '').toLowerCase(), regex: getRegExp(columnValue, 'i') }); } } else { var val = $.trim(args[0]); if (val) { searchConditions.push({ column: '', regex: getRegExp(val, 'i') }); } } });
        }; $scope.$watch(grid.config.filterOptions.filterText, function (a) { $scope.filterText = a; }); $scope.$watch('filterText', function (a) { if (!self.extFilter) { $scope.$emit('filterChanged', a); buildSearchConditions(a); self.evalFilter(); } }); if (!self.extFilter) {
            $scope.$watch('columns', function (a) {
                angular.forEach(a, function (col) {
                    if (col.field)
                        self.fieldMap[col.field.split('.')[0]] = col; if (col.displayName)
                            self.fieldMap[col.displayName.toLowerCase().replace(/\s+/g, '')] = col;
                });
            });
        }
    }; ng.SelectionService = function (grid) {
        var self = this; self.multi = grid.config.multiSelect; self.selectedItems = grid.config.selectedItems; self.selectedIndex = grid.config.selectedIndex; self.lastClickedRow = undefined; self.ignoreSelectedItemChanges = false; self.rowFactory = {}; self.Initialize = function (rowFactory) { self.rowFactory = rowFactory; }; self.ChangeSelection = function (rowItem, evt) {
            if (evt && evt.shiftKey && self.multi) {
                if (self.lastClickedRow) {
                    var thisIndx = grid.filteredData.indexOf(rowItem.entity); var prevIndx = grid.filteredData.indexOf(self.lastClickedRow.entity); self.lastClickedRow = self.rowFactory.rowCache[thisIndx]; if (thisIndx == prevIndx) { return false; }
                    if (thisIndx < prevIndx) { thisIndx = thisIndx ^ prevIndx; prevIndx = thisIndx ^ prevIndx; thisIndx = thisIndx ^ prevIndx; thisIndx--; } else { prevIndx++; }
                    var rows = []; for (; prevIndx <= thisIndx; prevIndx++) { rows.push(self.rowFactory.rowCache[prevIndx]); }
                    if (rows[rows.length - 1].beforeSelectionChange(rows, evt)) { $.each(rows, function (i, ri) { var selectionState = ri.selected; ri.selected = !selectionState; ri.entity[SELECTED_PROP] = !selectionState; var index = self.selectedItems.indexOf(ri.entity); if (index === -1) { self.selectedItems.push(ri.entity); } else { self.selectedItems.splice(index, 1); } }); rows[rows.length - 1].afterSelectionChange(rows, evt); }
                    return true;
                }
            } else if (!self.multi) {
                if (self.lastClickedRow) {
                    for (var i = 0; i < self.rowFactory.rowCache.length; i++) { if (self.rowFactory.rowCache[i] && self.rowFactory.rowCache[i].entity == self.lastClickedRow.entity) { self.lastClickedRow = self.rowFactory.rowCache[i]; break; } }
                    self.setSelection(self.lastClickedRow, false); if (self.lastClickedRow.entity == rowItem.entity) { self.lastClickedRow = undefined; return true; }
                    self.setSelection(rowItem, grid.config.keepLastSelected ? true : !rowItem.selected);
                } else { self.setSelection(rowItem, grid.config.keepLastSelected ? true : !rowItem.selected); }
            } else { self.setSelection(rowItem, !rowItem.selected); }
            self.lastClickedRow = rowItem; return true;
        }; self.setSelection = function (rowItem, isSelected) {
            rowItem.selected = isSelected; rowItem.entity[SELECTED_PROP] = isSelected; if (!isSelected) { var indx = self.selectedItems.indexOf(rowItem.entity); if (indx != -1) { self.selectedItems.splice(indx, 1); } } else {
                if (self.selectedItems.indexOf(rowItem.entity) === -1) {
                    if (!self.multi && self.selectedItems.length > 0) { self.toggleSelectAll(false); rowItem.selected = isSelected; rowItem.entity[SELECTED_PROP] = isSelected; }
                    self.selectedItems.push(rowItem.entity);
                }
            }
        }; self.toggleSelectAll = function (checkAll) {
            angular.forEach(grid.filteredData, function (item, i) { grid.rowFactory.buildEntityRow(item, i); }); if (grid.config.beforeSelectionChange(grid.rowFactory.rowCache)) {
                var selectedlength = self.selectedItems.length; if (selectedlength > 0) { self.selectedItems.splice(0, selectedlength); }
                angular.forEach(grid.filteredData, function (item) { item[SELECTED_PROP] = checkAll; if (checkAll) { self.selectedItems.push(item); } }); angular.forEach(self.rowFactory.rowCache, function (row) { row.selected = checkAll; }); grid.config.afterSelectionChange(grid.rowFactory.rowCache);
            }
        };
    }; ng.StyleProvider = function ($scope, grid, domUtilityService) { $scope.headerCellStyle = function (col) { return { "height": col.headerRowHeight + "px" }; }; $scope.rowStyle = function (row) { return { "top": row.offsetTop + "px", "height": $scope.rowHeight + "px" }; }; $scope.canvasStyle = function () { return { "height": grid.maxCanvasHt.toString() + "px" }; }; $scope.headerScrollerStyle = function () { return { "height": grid.config.headerRowHeight + "px" }; }; $scope.topPanelStyle = function () { return { "width": grid.rootDim.outerWidth + "px", "height": $scope.topPanelHeight() + "px" }; }; $scope.headerStyle = function () { return { "width": (grid.rootDim.outerWidth - domUtilityService.ScrollW) + "px", "height": grid.config.headerRowHeight + "px" }; }; $scope.viewportStyle = function () { return { "width": grid.rootDim.outerWidth + "px", "height": $scope.viewportDimHeight() + "px" }; }; $scope.footerStyle = function () { return { "width": grid.rootDim.outerWidth + "px", "height": $scope.footerRowHeight + "px" }; }; }; ngGridDirectives.directive('ngGrid', ['$compile', '$filter', 'SortService', 'DomUtilityService', function ($compile, $filter, sortService, domUtilityService) {
        var ngGrid = {
            scope: true, compile: function () {
                return {
                    pre: function ($scope, iElement, iAttrs) {
                        var $element = $(iElement); var options = $scope.$eval(iAttrs.ngGrid); options.gridDim = new ng.Dimension({ outerHeight: $($element).height(), outerWidth: $($element).width() }); var grid = new ng.Grid($scope, options, sortService, domUtilityService, $filter); if (typeof options.columnDefs == "string") { $scope.$parent.$watch(options.columnDefs, function (a) { $scope.columns = []; grid.config.columnDefs = a; grid.buildColumns(); grid.eventProvider.assignEvents(); domUtilityService.RebuildGrid($scope, grid); }); } else { grid.buildColumns(); }
                        if (typeof options.data == "string") {
                            var prevlength = 0; var dataWatcher = function (a) {
                                prevlength = a ? a.length : 0; grid.sortedData = $scope.$eval(options.data) || []; grid.searchProvider.evalFilter(); grid.configureColumnWidths(); grid.refreshDomSizes(); if (grid.config.sortInfo) {
                                    if (!grid.config.sortInfo.column) { grid.config.sortInfo.column = $scope.columns.filter(function (c) { return c.field == grid.config.sortInfo.field; })[0]; if (!grid.config.sortInfo.column) { return; } }
                                    grid.config.sortInfo.column.sortDirection = grid.config.sortInfo.direction.toLowerCase(); grid.sortData(grid.config.sortInfo.column);
                                }
                            }; $scope.$parent.$watch(options.data, dataWatcher); $scope.$parent.$watch(options.data + '.length', function (a) { if (a != prevlength) { dataWatcher($scope.$eval(options.data)); } });
                        }
                        var htmlText = ng.defaultGridTemplate(grid.config); grid.footerController = new ng.Footer($scope, grid); iElement.addClass("ngGrid").addClass(grid.gridId.toString()); if (options.jqueryUITheme) { iElement.addClass('ui-widget'); }
                        iElement.append($compile(htmlText)($scope)); domUtilityService.AssignGridContainers($scope, iElement, grid); grid.eventProvider = new ng.EventProvider(grid, $scope, domUtilityService); angular.forEach(options.plugins, function (p) { p.init($scope.$new(), grid, { SortService: sortService, DomUtilityService: domUtilityService }); }); return null;
                    }
                };
            }
        }; return ngGrid;
    }]); ngGridDirectives.directive('ngRow', ['$compile', function ($compile) {
        var ngRow = {
            scope: false, compile: function () {
                return {
                    pre: function ($scope, iElement) {
                        if ($scope.row.isAggRow) {
                            var html = ng.aggregateTemplate(); if ($scope.row.aggLabelFilter) { html = html.replace(CUSTOM_FILTERS, '| ' + $scope.row.aggLabelFilter); } else { html = html.replace(CUSTOM_FILTERS, ""); }
                            iElement.append($compile(html)($scope));
                        } else { iElement.append($compile($scope.rowTemplate)($scope)); }
                    }
                };
            }
        }; return ngRow;
    }]); ngGridDirectives.directive('ngCell', ['$compile', function ($compile) { var ngCell = { scope: false, compile: function () { return { pre: function ($scope, iElement) { var html = $scope.col.cellTemplate; html = html.replace(COL_FIELD, 'row.entity.' + $scope.col.field); iElement.append($compile(html)($scope)); } }; } }; return ngCell; }]); ngGridDirectives.directive('ngHeaderRow', ['$compile', function ($compile) { var ngHeaderRow = { scope: false, compile: function () { return { pre: function ($scope, iElement) { if (iElement.children().length === 0) { iElement.append($compile($scope.headerRowTemplate)($scope)); } } }; } }; return ngHeaderRow; }]); ngGridDirectives.directive('ngHeaderCell', ['$compile', function ($compile) { var ngHeaderCell = { scope: false, compile: function () { return { pre: function ($scope, iElement) { iElement.append($compile($scope.col.headerCellTemplate)($scope)); } }; } }; return ngHeaderCell; }]); ngGridDirectives.directive('ngViewport', ['DomUtilityService', function (domUtilityService) {
        return function (scope, elm, attrs) {
            var changeUserSelect = function (elm, value, evt) { elm.css({ '-webkit-touch-callout': value, '-webkit-user-select': value, '-khtml-user-select': value, '-moz-user-select': value == 'none' ? '-moz-none' : value, '-ms-user-select': value, 'user-select': value }); }; elm.bind('scroll', function (evt) { var scrollLeft = evt.target.scrollLeft, scrollTop = evt.target.scrollTop; scope.adjustScrollLeft(scrollLeft); scope.adjustScrollTop(scrollTop); return true; }); var doingKeyDown = false; elm.bind('keydown', function (evt) {
                if (evt.keyCode == 16) { changeUserSelect(elm, 'none', evt); return true; } else if (!doingKeyDown) { doingKeyDown = true; var ret = ng.moveSelectionHandler(scope, elm, evt); doingKeyDown = false; return ret; }
                return false;
            }); elm.bind('keyup', function (evt) {
                if (evt.keyCode == 16) { changeUserSelect(elm, 'text', evt); }
                return true;
            });
        }
    }]); ngGridDirectives.directive('ngCellText', function () { return function (scope, elm, attrs) { elm.bind('mouseover', function (evt) { evt.preventDefault(); elm.css({ 'cursor': 'text' }); }); elm.bind('mouseleave', function (evt) { evt.preventDefault(); elm.css({ 'cursor': 'default' }); }); }; }); angular.module('ngGrid', ['ngGrid.services', 'ngGrid.directives', 'ngGrid.filters']); window.ngGrid.i18n['en'] = { ngAggregateLabel: 'items', ngGroupPanelDescription: 'Drag a column header here and drop it to group by that column.', ngSearchPlaceHolder: 'Search...', ngMenuText: 'Choose Columns:', ngShowingItemsLabel: 'Showing Items:', ngTotalItemsLabel: 'Total Items:', ngSelectedItemsLabel: 'Selected Items:', ngPageSizeLabel: 'Page Size:', ngPagerFirstTitle: 'First Page', ngPagerNextTitle: 'Next Page', ngPagerPrevTitle: 'Previous Page', ngPagerLastTitle: 'Last Page' };
}(window));