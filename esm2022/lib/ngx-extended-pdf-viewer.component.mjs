import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Inject, Input, Output, PLATFORM_ID, ViewChild, } from '@angular/core';
import { PdfCursorTools } from './options/pdf-cursor-tools';
import { assetsUrl, getVersionSuffix, pdfDefaultOptions } from './options/pdf-default-options';
import { ScrollModeType } from './options/pdf-viewer';
import { VerbosityLevel } from './options/verbosity-level';
import { PdfDummyComponentsComponent } from './pdf-dummy-components/pdf-dummy-components.component';
import { NgxFormSupport } from './ngx-form-support';
import { PdfSidebarView } from './options/pdf-sidebar-views';
import * as i0 from "@angular/core";
import * as i1 from "./pdf-notification-service";
import * as i2 from "@angular/common";
import * as i3 from "./ngx-extended-pdf-viewer.service";
import * as i4 from "./pdf-script-loader.service";
import * as i5 from "./ngx-keyboard-manager.service";
import * as i6 from "./pdf-csp-policy.service";
import * as i7 from "./dynamic-css/dynamic-css.component";
import * as i8 from "./theme/acroform-default-theme/pdf-acroform-default-theme.component";
import * as i9 from "./toolbar/pdf-context-menu/pdf-context-menu.component";
import * as i10 from "./theme/pdf-dark-theme/pdf-dark-theme.component";
import * as i11 from "./pdf-dialog/pdf-alt-text-dialog/pdf-alt-text-dialog.component";
import * as i12 from "./pdf-dialog/pdf-alt-text-settings-dialog/pdf-alt-text-settings-dialog.component";
import * as i13 from "./pdf-dialog/pdf-document-properties-dialog/pdf-document-properties-dialog.component";
import * as i14 from "./pdf-dummy-components/pdf-dummy-components.component";
import * as i15 from "./pdf-dialog/pdf-error-message/pdf-error-message.component";
import * as i16 from "./toolbar/pdf-findbar/pdf-findbar.component";
import * as i17 from "./theme/pdf-light-theme/pdf-light-theme.component";
import * as i18 from "./pdf-dialog/pdf-password-dialog/pdf-password-dialog.component";
import * as i19 from "./pdf-dialog/pdf-prepare-printing-dialog/pdf-prepare-printing-dialog.component";
import * as i20 from "./secondary-toolbar/pdf-secondary-toolbar/pdf-secondary-toolbar.component";
import * as i21 from "./sidebar/pdf-sidebar/pdf-sidebar.component";
import * as i22 from "./toolbar/pdf-toolbar/pdf-toolbar.component";
import * as i23 from "./translate.pipe";
export class NgxExtendedPdfViewerComponent {
    platformId;
    notificationService;
    elementRef;
    platformLocation;
    cdr;
    service;
    renderer;
    pdfScriptLoaderService;
    keyboardManager;
    cspPolicyService;
    ngZone;
    formSupport = new NgxFormSupport();
    /**
     * The dummy components are inserted automatically when the user customizes the toolbar
     * without adding every original toolbar item. Without the dummy components, the
     * initialization code of pdf.js crashes because it assume that every standard widget is there.
     */
    dummyComponents;
    root;
    annotationEditorEvent = new EventEmitter();
    /* UI templates */
    customFindbarInputArea;
    customToolbar;
    customFindbar;
    customFindbarButtons;
    customPdfViewer;
    customSecondaryToolbar;
    customSidebar;
    customThumbnail;
    customFreeFloatingBar;
    showFreeFloatingBar = true;
    enableDragAndDrop = true;
    forceUsingLegacyES5 = false;
    localizationInitialized = false;
    resizeObserver;
    initialAngularFormData = undefined;
    set formData(formData) {
        if (this.initialAngularFormData === undefined) {
            this.initialAngularFormData = formData;
        }
        this.formSupport.formData = formData;
    }
    disableForms = false;
    get formDataChange() {
        return this.formSupport.formDataChange;
    }
    _pageViewMode = 'multiple';
    baseHref;
    /** This flag prevents trying to load a file twice if the user uploads it using the file upload dialog or via drag'n'drop */
    srcChangeTriggeredByUser = false;
    get pageViewMode() {
        return this._pageViewMode;
    }
    set pageViewMode(viewMode) {
        if (!isPlatformBrowser(this.platformId))
            return;
        const hasChanged = this._pageViewMode !== viewMode;
        if (!hasChanged)
            return;
        const mustRedraw = !this.pdfScriptLoaderService.ngxExtendedPdfViewerIncompletelyInitialized && (this._pageViewMode === 'book' || viewMode === 'book');
        this._pageViewMode = viewMode;
        this.pageViewModeChange.emit(this._pageViewMode);
        const PDFViewerApplicationOptions = this.pdfScriptLoaderService.PDFViewerApplicationOptions;
        PDFViewerApplicationOptions?.set('pageViewMode', this.pageViewMode);
        const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
        if (PDFViewerApplication) {
            PDFViewerApplication.pdfViewer.pageViewMode = this._pageViewMode;
            PDFViewerApplication.findController._pageViewMode = this._pageViewMode;
        }
        this.handleViewMode(viewMode);
        if (mustRedraw) {
            this.redrawViewer(viewMode);
        }
    }
    handleViewMode(viewMode) {
        switch (viewMode) {
            case 'infinite-scroll':
                this.handleInfiniteScrollMode();
                break;
            case 'single':
                this.handleSinglePageMode();
                break;
            case 'book':
                this.handleBookMode();
                break;
            case 'multiple':
                this.handleMultiplePageMode();
                break;
            default:
                this.scrollMode = ScrollModeType.vertical;
        }
    }
    handleInfiniteScrollMode() {
        if (this.scrollMode === ScrollModeType.page || this.scrollMode === ScrollModeType.horizontal) {
            this.scrollMode = ScrollModeType.vertical;
            this.pdfScriptLoaderService.PDFViewerApplication.eventBus.dispatch('switchscrollmode', { mode: Number(this.scrollMode) });
        }
        setTimeout(() => {
            // this timeout is necessary because @Input() is called before the child components are initialized
            // (and the DynamicCssComponent is a child component)
            this.dynamicCSSComponent.removeScrollbarInInfiniteScrollMode(false, this.pageViewMode, this.primaryMenuVisible, this, this.logLevel);
        });
    }
    // since pdf.js, our custom single-page-mode has been replaced by the standard scrollMode="page"
    handleSinglePageMode() {
        this.scrollMode = ScrollModeType.page;
        this._pageViewMode = 'single';
    }
    handleBookMode() {
        this.showBorders = false;
        if (this.scrollMode !== ScrollModeType.vertical) {
            this.scrollMode = ScrollModeType.vertical;
        }
    }
    handleMultiplePageMode() {
        if (this.scrollMode === ScrollModeType.page) {
            this.scrollMode = ScrollModeType.vertical;
        }
        setTimeout(() => {
            // this timeout is necessary because @Input() is called before the child components are initialized
            // (and the DynamicCssComponent is a child component)
            this.dynamicCSSComponent.removeScrollbarInInfiniteScrollMode(true, this.pageViewMode, this.primaryMenuVisible, this, this.logLevel);
        });
    }
    redrawViewer(viewMode) {
        if (viewMode !== 'book') {
            const ngx = this.elementRef.nativeElement;
            const viewerContainer = ngx.querySelector('#viewerContainer');
            viewerContainer.style.width = '';
            viewerContainer.style.overflow = '';
            viewerContainer.style.marginRight = '';
            viewerContainer.style.marginLeft = '';
            const viewer = ngx.querySelector('#viewer');
            viewer.style.maxWidth = '';
            viewer.style.minWidth = '';
        }
        this.openPDF2();
    }
    markForCheck() {
        this.cdr.markForCheck();
    }
    pageViewModeChange = new EventEmitter();
    progress = new EventEmitter();
    secondaryToolbarComponent;
    dynamicCSSComponent;
    sidebarComponent;
    /* regular attributes */
    _src;
    srcChange = new EventEmitter();
    _scrollMode = ScrollModeType.vertical;
    get scrollMode() {
        return this._scrollMode;
    }
    set scrollMode(value) {
        if (this._scrollMode !== value) {
            const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
            if (PDFViewerApplication?.pdfViewer) {
                if (PDFViewerApplication.pdfViewer.scrollMode !== Number(this.scrollMode)) {
                    PDFViewerApplication.eventBus.dispatch('switchscrollmode', { mode: Number(this.scrollMode) });
                }
            }
            this._scrollMode = value;
            if (this._scrollMode === ScrollModeType.page) {
                if (this.pageViewMode !== 'single') {
                    this._pageViewMode = 'single';
                    this.pageViewModeChange.emit(this.pageViewMode);
                }
            }
            else if (this.pageViewMode === 'single' || this._scrollMode === ScrollModeType.horizontal) {
                this._pageViewMode = 'multiple';
                this.pageViewModeChange.emit(this.pageViewMode);
            }
        }
    }
    scrollModeChange = new EventEmitter();
    authorization = undefined;
    httpHeaders = undefined;
    contextMenuAllowed = true;
    afterPrint = new EventEmitter();
    beforePrint = new EventEmitter();
    currentZoomFactor = new EventEmitter();
    /** This field stores the previous zoom level if the page is enlarged with a double-tap or double-click */
    previousZoom;
    enablePrint = true;
    get enablePrintAutoRotate() {
        return pdfDefaultOptions.enablePrintAutoRotate;
    }
    set enablePrintAutoRotate(value) {
        pdfDefaultOptions.enablePrintAutoRotate = value;
        if (this.pdfScriptLoaderService.PDFViewerApplication?.pdfViewer) {
            this.pdfScriptLoaderService.PDFViewerApplication.pdfViewer.enablePrintAutoRotate = value;
        }
    }
    showTextEditor = 'xxl';
    showStampEditor = 'xxl';
    showDrawEditor = 'xxl';
    showHighlightEditor = 'xxl';
    /** How many log messages should be printed?
     * Legal values: VerbosityLevel.INFOS (= 5), VerbosityLevel.WARNINGS (= 1), VerbosityLevel.ERRORS (= 0) */
    logLevel = VerbosityLevel.WARNINGS;
    relativeCoordsOptions = {};
    /** Use the minified (minifiedJSLibraries="true", which is the default) or the user-readable pdf.js library (minifiedJSLibraries="false") */
    get minifiedJSLibraries() {
        return pdfDefaultOptions._internalFilenameSuffix === '.min';
    }
    set minifiedJSLibraries(value) {
        pdfDefaultOptions._internalFilenameSuffix = value ? '.min' : '';
    }
    primaryMenuVisible = true;
    /** option to increase (or reduce) print resolution. Default is 150 (dpi). Sensible values
     * are 300, 600, and 1200. Note the increase memory consumption, which may even result in a browser crash. */
    printResolution = null;
    rotation;
    rotationChange = new EventEmitter();
    annotationLayerRendered = new EventEmitter();
    annotationEditorLayerRendered = new EventEmitter();
    xfaLayerRendered = new EventEmitter();
    outlineLoaded = new EventEmitter();
    attachmentsloaded = new EventEmitter();
    layersloaded = new EventEmitter();
    hasSignature;
    set src(url) {
        if (url instanceof Uint8Array) {
            this._src = url.buffer;
        }
        else if (url instanceof URL) {
            this._src = url.toString();
        }
        else if (typeof Blob !== 'undefined' && url instanceof Blob) {
            (async () => {
                this.src = await this.convertBlobToUint8Array(url);
                if (this.service.ngxExtendedPdfViewerInitialized) {
                    if (this.pdfScriptLoaderService.ngxExtendedPdfViewerIncompletelyInitialized) {
                        this.openPDF();
                    }
                    else {
                        (async () => this.openPDF2())();
                    }
                    // else openPDF is called later, so we do nothing to prevent loading the PDF file twice
                }
            })();
        }
        else if (typeof url === 'string') {
            this._src = url;
            if (url.length > 980) {
                // minimal length of a base64 encoded PDF
                if (url.length % 4 === 0) {
                    if (/^[a-zA-Z\d/+]+={0,2}$/.test(url)) {
                        console.error('The URL looks like a base64 encoded string. If so, please use the attribute [base64Src] instead of [src]');
                    }
                }
            }
        }
        else {
            this._src = url;
        }
    }
    async convertBlobToUint8Array(blob) {
        // first try the algorithm for modern browsers and node.js
        if (blob.arrayBuffer) {
            const arrayBuffer = await blob.arrayBuffer();
            return new Uint8Array(arrayBuffer);
        }
        // then try the old-fashioned way
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    resolve(new Uint8Array(reader.result));
                }
                else {
                    reject(new Error('Error converting Blob to Uint8Array'));
                }
            };
            reader.onerror = () => {
                reject(new Error('FileReader error'));
            };
            reader.readAsArrayBuffer(blob);
        });
    }
    set base64Src(base64) {
        if (base64) {
            if (typeof window === 'undefined') {
                // server-side rendering
                return;
            }
            const binary_string = atob(base64);
            const len = binary_string.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binary_string.charCodeAt(i);
            }
            this.src = bytes.buffer;
        }
        else {
            this._src = undefined;
        }
    }
    /**
     * The combination of height, minHeight, and autoHeight ensures the PDF height of the PDF viewer is calculated correctly when the height is a percentage.
     * By default, many CSS frameworks make a div with 100% have a height or zero pixels. checkHeigth() fixes this.
     */
    autoHeight = false;
    minHeight = undefined;
    _height = '100%';
    set height(h) {
        this.minHeight = undefined;
        this.autoHeight = false;
        if (h) {
            if (h === 'auto') {
                this.autoHeight = true;
                this._height = undefined;
            }
            else {
                this._height = h;
            }
        }
        else {
            this.height = '100%';
        }
        setTimeout(() => {
            // this timeout is necessary because @Input() is called before the child components are initialized
            // (and the DynamicCssComponent is a child component)
            this.dynamicCSSComponent.checkHeight(this, this.logLevel);
        });
    }
    get height() {
        return this._height;
    }
    backgroundColor = '#e8e8eb';
    /** Allows the user to define the name of the file after clicking "download" */
    filenameForDownload = undefined;
    /** Allows the user to disable the keyboard bindings completely */
    ignoreKeyboard = false;
    /** Allows the user to disable a list of key bindings. */
    ignoreKeys = [];
    /** Allows the user to enable a list of key bindings explicitly. If this property is set, every other key binding is ignored. */
    acceptKeys = [];
    hasTextLayer = true;
    /** Allows the user to put the viewer's svg images into an arbitrary folder */
    imageResourcesPath = assetsUrl(pdfDefaultOptions.assetsFolder) + '/images/';
    /** Allows the user to put their locale folder into an arbitrary folder */
    localeFolderPath = assetsUrl(pdfDefaultOptions.assetsFolder) + '/locale';
    /** Override the default locale. This must be the complete locale name, such as "es-ES". The string is allowed to be all lowercase.
     */
    language = typeof window === 'undefined' ? 'en' : navigator.language;
    /** By default, listening to the URL is deactivated because often the anchor tag is used for the Angular router */
    listenToURL = false;
    /** Navigate to a certain "named destination" */
    nameddest = undefined;
    /** allows you to pass a password to read password-protected files */
    password = undefined;
    replaceBrowserPrint = true;
    originalPrint = typeof window !== 'undefined' ? window.print : undefined;
    _showSidebarButton = true;
    useInlineScripts = true;
    viewerPositionTop = '32px';
    /** pdf.js can show signatures, but fails to verify them. So they are switched off by default.
     * Set "[showUnverifiedSignatures]"="true" to display e-signatures nonetheless.
     */
    showUnverifiedSignatures = false;
    startTabindex;
    get showSidebarButton() {
        return this._showSidebarButton;
    }
    set showSidebarButton(show) {
        if (typeof window === 'undefined') {
            // server-side rendering
            this._showSidebarButton = false;
            return;
        }
        this._showSidebarButton = show;
        if (this._showSidebarButton) {
            const isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
            let factor = 1;
            if (isIE) {
                factor = Number((this._mobileFriendlyZoom || '100').replace('%', '')) / 100;
            }
            this.findbarLeft = (68 * factor).toString() + 'px';
            return;
        }
        this.findbarLeft = '0px';
    }
    _sidebarVisible = undefined;
    get sidebarVisible() {
        return this._sidebarVisible;
    }
    set sidebarVisible(value) {
        if (value !== this._sidebarVisible) {
            this.sidebarVisibleChange.emit(value);
        }
        this._sidebarVisible = value;
        const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
        if (PDFViewerApplication?.pdfSidebar) {
            if (this.sidebarVisible) {
                PDFViewerApplication.pdfSidebar.open();
                const view = Number(this.activeSidebarView);
                if (view === 1 || view === 2 || view === 3 || view === 4) {
                    PDFViewerApplication.pdfSidebar.switchView(view, true);
                }
                else {
                    console.error('[activeSidebarView] must be an integer value between 1 and 4');
                }
            }
            else {
                PDFViewerApplication.pdfSidebar.close();
            }
        }
    }
    sidebarVisibleChange = new EventEmitter();
    activeSidebarView = PdfSidebarView.OUTLINE;
    activeSidebarViewChange = new EventEmitter();
    findbarVisible = false;
    findbarVisibleChange = new EventEmitter();
    propertiesDialogVisible = false;
    propertiesDialogVisibleChange = new EventEmitter();
    showFindButton = undefined;
    showFindHighlightAll = true;
    showFindMatchCase = true;
    showFindMultiple = true;
    showFindRegexp = false;
    showFindEntireWord = true;
    showFindMatchDiacritics = true;
    showFindResultsCount = true;
    showFindMessages = true;
    showPagingButtons = true;
    showFirstAndLastPageButtons = true;
    showPreviousAndNextPageButtons = true;
    showPageNumber = true;
    showPageLabel = true;
    showZoomButtons = true;
    showZoomDropdown = true;
    showPresentationModeButton = false;
    showOpenFileButton = true;
    showPrintButton = true;
    showDownloadButton = true;
    theme = 'light';
    showToolbar = true;
    showSecondaryToolbarButton = true;
    showSinglePageModeButton = true;
    showVerticalScrollButton = true;
    showHorizontalScrollButton = true;
    showWrappedScrollButton = true;
    showInfiniteScrollButton = true;
    showBookModeButton = true;
    set showRotateButton(visibility) {
        this.showRotateCwButton = visibility;
        this.showRotateCcwButton = visibility;
    }
    showRotateCwButton = true;
    showRotateCcwButton = true;
    _handTool = !this.isIOS();
    set handTool(handTool) {
        if (this.isIOS() && handTool) {
            console.log("On iOS, the handtool doesn't work reliably. Plus, you don't need it because touch gestures allow you to distinguish easily between swiping and selecting text. Therefore, the library ignores your setting.");
            return;
        }
        this._handTool = handTool;
    }
    get handTool() {
        return this._handTool;
    }
    handToolChange = new EventEmitter();
    showHandToolButton = false;
    showSpreadButton = true;
    showPropertiesButton = true;
    showBorders = true;
    spread;
    set showScrollingButtons(show) {
        this.showVerticalScrollButton = show;
        this.showHorizontalScrollButton = show;
        this.showWrappedScrollButton = show;
        this.showInfiniteScrollButton = show;
        this.showBookModeButton = show;
        this.showSinglePageModeButton = show;
    }
    spreadChange = new EventEmitter();
    thumbnailDrawn = new EventEmitter();
    _page = undefined;
    get page() {
        return this._page;
    }
    set page(newPageNumber) {
        if (newPageNumber) {
            // silently cope with strings
            this._page = Number(newPageNumber);
        }
        else {
            this._page = undefined;
        }
    }
    pageChange = new EventEmitter();
    pageLabel = undefined;
    pageLabelChange = new EventEmitter();
    pagesLoaded = new EventEmitter();
    pageRender = new EventEmitter();
    pageRendered = new EventEmitter();
    pdfDownloaded = new EventEmitter();
    pdfLoaded = new EventEmitter();
    pdfLoadingStarts = new EventEmitter();
    pdfLoadingFailed = new EventEmitter();
    textLayer = undefined;
    textLayerRendered = new EventEmitter();
    annotationEditorModeChanged = new EventEmitter();
    updateFindMatchesCount = new EventEmitter();
    updateFindState = new EventEmitter();
    /** Legal values: undefined, 'auto', 'page-actual', 'page-fit', 'page-width', or '50' (or any other percentage) */
    zoom = undefined;
    zoomChange = new EventEmitter();
    _zoomLevels = ['auto', 'page-actual', 'page-fit', 'page-width', 0.5, 1, 1.25, 1.5, 2, 3, 4];
    get zoomLevels() {
        if (this.maxZoom && this.maxZoom === this.minZoom) {
            return [this.maxZoom];
        }
        return this._zoomLevels;
    }
    set zoomLevels(value) {
        this._zoomLevels = value;
    }
    maxZoom = 10;
    minZoom = 0.1;
    /** This attribute allows you to increase the size of the UI elements so you can use them on small mobile devices.
     * This attribute is a string with a percent character at the end (e.g. "150%").
     */
    _mobileFriendlyZoom = '100%';
    mobileFriendlyZoomScale = 1;
    toolbarMarginTop = '0px';
    toolbarWidth = '100%';
    toolbar = undefined;
    onToolbarLoaded(toolbarElement) {
        this.toolbar = toolbarElement;
    }
    secondaryToolbarTop = undefined;
    sidebarPositionTop = undefined;
    // dirty IE11 hack - temporary solution
    findbarTop = undefined;
    // dirty IE11 hack - temporary solution
    findbarLeft = undefined;
    initializationPromise = null;
    checkRootElementTimeout;
    destroyInitialization = false;
    get mobileFriendlyZoom() {
        return this._mobileFriendlyZoom;
    }
    get pdfJsVersion() {
        return getVersionSuffix(pdfDefaultOptions.assetsFolder);
    }
    get majorMinorPdfJsVersion() {
        const fullVersion = this.pdfJsVersion;
        const pos = fullVersion.lastIndexOf('.');
        return fullVersion.substring(0, pos).replace('.', '-');
    }
    /**
     * This attributes allows you to increase the size of the UI elements so you can use them on small mobile devices.
     * This attribute is a string with a percent character at the end (e.g. "150%").
     */
    set mobileFriendlyZoom(zoom) {
        // tslint:disable-next-line:triple-equals - the type conversion is intended
        if (zoom == 'true') {
            zoom = '150%';
            // tslint:disable-next-line:triple-equals - the type conversion is intended
        }
        else if (zoom == 'false' || zoom === undefined || zoom === null) {
            zoom = '100%';
        }
        this._mobileFriendlyZoom = zoom;
        let factor = 1;
        if (!String(zoom).includes('%')) {
            zoom = 100 * Number(zoom) + '%';
        }
        factor = Number((zoom || '100').replace('%', '')) / 100;
        this.mobileFriendlyZoomScale = factor;
        this.toolbarWidth = (100 / factor).toString() + '%';
        this.toolbarMarginTop = (factor - 1) * 16 + 'px';
        setTimeout(() => this.calcViewerPositionTop());
    }
    serverSideRendering = true;
    /**
     * Checks if the code is running in a browser environment.
     */
    isBrowser() {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    }
    calcViewerPositionTop() {
        if (!this.isBrowser()) {
            return;
        }
        if (this.toolbar === undefined) {
            this.sidebarPositionTop = '0';
            return;
        }
        const top = this.toolbar.getBoundingClientRect().height;
        if (top < 33) {
            this.viewerPositionTop = '33px';
        }
        else {
            this.viewerPositionTop = top + 'px';
        }
        const factor = top / 33;
        if (this.primaryMenuVisible) {
            this.sidebarPositionTop = (33 + 33 * (factor - 1)).toString() + 'px';
        }
        else {
            this.sidebarPositionTop = '0';
        }
        this.secondaryToolbarTop = (33 + 38 * (factor - 1)).toString() + 'px';
        this.findbarTop = (33 + 38 * (factor - 1)).toString() + 'px';
        const findButton = document.getElementById('primaryViewFind');
        if (findButton) {
            const containerPositionLeft = this.toolbar.getBoundingClientRect().left;
            const findButtonPosition = findButton.getBoundingClientRect();
            const left = Math.max(0, findButtonPosition.left - containerPositionLeft);
            this.findbarLeft = left + 'px';
        }
        else if (this.showSidebarButton) {
            this.findbarLeft = (34 + 32 * factor).toString() + 'px';
        }
        else {
            this.findbarLeft = '0';
        }
    }
    constructor(platformId, notificationService, elementRef, platformLocation, cdr, service, renderer, pdfScriptLoaderService, keyboardManager, cspPolicyService, ngZone) {
        this.platformId = platformId;
        this.notificationService = notificationService;
        this.elementRef = elementRef;
        this.platformLocation = platformLocation;
        this.cdr = cdr;
        this.service = service;
        this.renderer = renderer;
        this.pdfScriptLoaderService = pdfScriptLoaderService;
        this.keyboardManager = keyboardManager;
        this.cspPolicyService = cspPolicyService;
        this.ngZone = ngZone;
        this.baseHref = this.platformLocation.getBaseHrefFromDOM();
        if (isPlatformBrowser(this.platformId)) {
            this.serverSideRendering = false;
            this.toolbarWidth = String(document.body.clientWidth);
        }
    }
    isIOS() {
        if (typeof window === 'undefined') {
            // server-side rendering
            return false;
        }
        return (['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
            // iPad on iOS 13 detection
            (navigator.userAgent.includes('Mac') && 'ontouchend' in document));
    }
    reportSourceChanges(change) {
        this._src = change.sourcefile;
        this.srcChangeTriggeredByUser = true;
        this.srcChange.emit(change.sourcefile);
        const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
        if (this.filenameForDownload) {
            PDFViewerApplication.appConfig.filenameForDownload = this.filenameForDownload;
        }
        else {
            PDFViewerApplication.appConfig.filenameForDownload = this.guessFilenameFromUrl(this._src);
        }
    }
    async ngOnInit() {
        this.hideToolbarIfItIsEmpty();
        if (isPlatformBrowser(this.platformId)) {
            this.ngZone.runOutsideAngular(() => {
                this.initializationPromise = this.initialize;
                this.initializationPromise();
            });
        }
    }
    async initialize() {
        try {
            await this.waitForRootElement();
            if (this.destroyInitialization)
                return;
            if (isPlatformBrowser(this.platformId)) {
                this.addTranslationsUnlessProvidedByTheUser();
                await this.waitUntilOldComponentIsGone();
                if (this.destroyInitialization)
                    return;
                await this.pdfScriptLoaderService.ensurePdfJsHasBeenLoaded(this.useInlineScripts, this.forceUsingLegacyES5);
                if (this.destroyInitialization)
                    return;
                if (this.formSupport) {
                    this.formSupport.registerFormSupportWithPdfjs(this.pdfScriptLoaderService.PDFViewerApplication);
                    this.keyboardManager.registerKeyboardListener(this.pdfScriptLoaderService.PDFViewerApplication);
                    this.pdfScriptLoaderService.PDFViewerApplication.cspPolicyService = this.cspPolicyService;
                    this.ngZone.runOutsideAngular(() => this.doInitPDFViewer());
                }
            }
        }
        catch (error) {
            console.error('Initialization failed:', error);
        }
    }
    async waitForRootElement() {
        return new Promise((resolve, reject) => {
            const checkRootElement = () => {
                if (this.destroyInitialization) {
                    reject(new Error('Component destroyed'));
                    return;
                }
                if (this.root && this.root.nativeElement && this.root.nativeElement.offsetParent !== null) {
                    resolve();
                }
                else {
                    this.checkRootElementTimeout = setTimeout(checkRootElement, 50);
                }
            };
            checkRootElement();
        });
    }
    async waitUntilOldComponentIsGone() {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!this.service.ngxExtendedPdfViewerInitialized) {
                    clearInterval(interval);
                    resolve();
                }
            }, 10);
        });
    }
    assignTabindexes() {
        if (this.startTabindex) {
            const r = this.root.nativeElement.cloneNode(true);
            r.classList.add('offscreen');
            this.showElementsRecursively(r);
            document.body.appendChild(r);
            const elements = this.collectElementPositions(r, this.root.nativeElement, []);
            document.body.removeChild(r);
            const topRightGreaterThanBottomLeftComparator = (a, b) => {
                if (a.y - b.y > 15) {
                    return 1;
                }
                if (b.y - a.y > 15) {
                    return -1;
                }
                return a.x - b.x;
            };
            const sorted = [...elements].sort(topRightGreaterThanBottomLeftComparator);
            for (let i = 0; i < sorted.length; i++) {
                sorted[i].element.tabIndex = this.startTabindex + i;
            }
        }
    }
    showElementsRecursively(root) {
        const classesToRemove = [
            'hidden',
            'invisible',
            'hiddenXXLView',
            'hiddenXLView',
            'hiddenLargeView',
            'hiddenMediumView',
            'hiddenSmallView',
            'hiddenTinyView',
            'visibleXXLView',
            'visibleXLView',
            'visibleLargeView',
            'visibleMediumView',
            'visibleSmallView',
            'visibleTinyView',
        ];
        root.classList.remove(...classesToRemove);
        if (root instanceof HTMLButtonElement || root instanceof HTMLAnchorElement || root instanceof HTMLInputElement || root instanceof HTMLSelectElement) {
            return;
        }
        else if (root.childElementCount > 0) {
            for (let i = 0; i < root.childElementCount; i++) {
                const c = root.children.item(i);
                if (c) {
                    this.showElementsRecursively(c);
                }
            }
        }
    }
    collectElementPositions(copy, original, elements) {
        if (copy instanceof HTMLButtonElement || copy instanceof HTMLAnchorElement || copy instanceof HTMLInputElement || copy instanceof HTMLSelectElement) {
            const rect = copy.getBoundingClientRect();
            const elementAndPos = {
                element: original,
                x: Math.round(rect.left),
                y: Math.round(rect.top),
            };
            elements.push(elementAndPos);
        }
        else if (copy.childElementCount > 0) {
            for (let i = 0; i < copy.childElementCount; i++) {
                const c = copy.children.item(i);
                const o = original.children.item(i);
                if (c && o) {
                    elements = this.collectElementPositions(c, o, elements);
                }
            }
        }
        return elements;
    }
    afterPrintListener = () => {
        this.afterPrint.emit();
    };
    beforePrintListener = () => {
        this.beforePrint.emit();
    };
    guessFilenameFromUrl(src) {
        if (src && typeof src === 'string') {
            const slash = src.lastIndexOf('/');
            if (slash > 0) {
                return src.substring(slash + 1);
            }
            else {
                return src;
            }
        }
        return undefined;
    }
    doInitPDFViewer() {
        if (typeof window === 'undefined') {
            // server-side rendering
            return;
        }
        if (this.service.ngxExtendedPdfViewerInitialized) {
            // tslint:disable-next-line:quotemark
            console.error("You're trying to open two instances of the PDF viewer. Most likely, this will result in errors.");
        }
        this.overrideDefaultSettings();
        const onLoaded = () => {
            if (!this.pdfScriptLoaderService.PDFViewerApplication.eventBus) {
                console.error("Eventbus is null? Let's try again.");
                setTimeout(() => {
                    onLoaded();
                }, 10);
            }
            else {
                this.pdfScriptLoaderService.PDFViewerApplication.eventBus.on('sourcechanged', this.reportSourceChanges.bind(this));
                this.pdfScriptLoaderService.PDFViewerApplication.eventBus.on('afterprint', this.afterPrintListener);
                this.pdfScriptLoaderService.PDFViewerApplication.eventBus.on('beforeprint', this.beforePrintListener);
                this.localizationInitialized = true;
                if (!this.pdfScriptLoaderService.shuttingDown) {
                    // hurried users sometimes reload the PDF before it has finished initializing
                    this.calcViewerPositionTop();
                    this.afterLibraryInit();
                    this.openPDF();
                    this.assignTabindexes();
                    if (this.replaceBrowserPrint) {
                        this.doReplaceBrowserPrint(this.replaceBrowserPrint);
                    }
                }
            }
        };
        document.addEventListener('webviewerinitialized', onLoaded, { once: true });
        this.activateTextlayerIfNecessary(null);
        setTimeout(() => {
            if (!this.pdfScriptLoaderService.shuttingDown) {
                // hurried users sometimes reload the PDF before it has finished initializing
                // This initializes the webviewer, the file may be passed in to it to initialize the viewer with a pdf directly
                this.initResizeObserver();
                this.onResize();
                this.hideToolbarIfItIsEmpty();
                this.dummyComponents.addMissingStandardWidgets();
                if (this.pdfScriptLoaderService.PDFViewerApplicationOptions) {
                    const PDFViewerApplicationOptions = this.pdfScriptLoaderService.PDFViewerApplicationOptions;
                    globalThis.PDFViewerApplicationOptions = PDFViewerApplicationOptions;
                }
                this.pdfScriptLoaderService.webViewerLoad(this.cspPolicyService);
                const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
                PDFViewerApplication.appConfig.defaultUrl = ''; // IE bugfix
                const PDFViewerApplicationOptions = this.pdfScriptLoaderService.PDFViewerApplicationOptions;
                PDFViewerApplicationOptions.set('enableDragAndDrop', this.enableDragAndDrop);
                PDFViewerApplicationOptions.set('localeProperties', { lang: this.language });
                PDFViewerApplicationOptions.set('imageResourcesPath', this.imageResourcesPath);
                PDFViewerApplicationOptions.set('minZoom', this.minZoom);
                PDFViewerApplicationOptions.set('maxZoom', this.maxZoom);
                PDFViewerApplicationOptions.set('pageViewMode', this.pageViewMode);
                PDFViewerApplicationOptions.set('verbosity', this.logLevel);
                if (this.theme === 'dark') {
                    PDFViewerApplicationOptions.set('viewerCssTheme', 2);
                }
                else if (this.theme === 'light') {
                    PDFViewerApplicationOptions.set('viewerCssTheme', 1);
                }
                PDFViewerApplication.isViewerEmbedded = true;
                if (PDFViewerApplication.printKeyDownListener) {
                    window.addEventListener('keydown', PDFViewerApplication.printKeyDownListener, true);
                }
                const body = document.getElementsByTagName('body');
                if (body[0]) {
                    const topLevelElements = body[0].children;
                    for (let i = topLevelElements.length - 1; i >= 0; i--) {
                        const e = topLevelElements.item(i);
                        if (e && e.id === 'printContainer') {
                            body[0].removeChild(e);
                        }
                    }
                }
                const pc = document.getElementById('printContainer');
                if (pc) {
                    document.getElementsByTagName('body')[0].appendChild(pc);
                }
            }
        }, 0);
    }
    addTranslationsUnlessProvidedByTheUser() {
        const link = this.renderer.createElement('link');
        link.rel = 'resource';
        link.type = 'application/l10n';
        link.href = this.localeFolderPath + '/locale.json';
        link.setAttribute('origin', 'ngx-extended-pdf-viewer');
        this.renderer.appendChild(this.elementRef.nativeElement, link);
    }
    hideToolbarIfItIsEmpty() {
        this.primaryMenuVisible = this.showToolbar;
        if (!this.showSecondaryToolbarButton || this.service.secondaryMenuIsEmpty) {
            if (!this.isPrimaryMenuVisible()) {
                this.primaryMenuVisible = false;
            }
        }
    }
    /** Notifies every widget that implements onLibraryInit() that the PDF viewer objects are available */
    afterLibraryInit() {
        queueMicrotask(() => this.notificationService.onPDFJSInitSignal.set(this.pdfScriptLoaderService.PDFViewerApplication));
    }
    onSpreadChange(newSpread) {
        this.spreadChange.emit(newSpread);
    }
    toggleVisibility = (elementId, cssClass = 'invisible') => {
        const element = document.getElementById(elementId);
        element?.classList.remove(cssClass);
    };
    activateTextlayerIfNecessary(options) {
        const setTextLayerMode = (mode) => {
            options?.set('textLayerMode', mode);
            this.pdfScriptLoaderService.PDFViewerApplication.pdfViewer?.setTextLayerMode(mode);
        };
        if (this.textLayer === undefined) {
            if (!this.handTool) {
                setTextLayerMode(pdfDefaultOptions.textLayerMode);
                this.textLayer = true;
                if (this.showFindButton === undefined) {
                    this.showFindButton = true;
                    setTimeout(() => {
                        this.toggleVisibility('viewFind');
                        this.toggleVisibility('findbar');
                    });
                }
            }
            else {
                setTextLayerMode(this.showHandToolButton ? pdfDefaultOptions.textLayerMode : 0);
                if (!this.showHandToolButton) {
                    if (this.showFindButton || this.showFindButton === undefined) {
                        queueMicrotask(() => {
                            this.showFindButton = false;
                        });
                        if (this.logLevel >= VerbosityLevel.WARNINGS) {
                            console.warn(
                            // tslint:disable-next-line:max-line-length
                            'Hiding the "find" button because the text layer of the PDF file is not rendered. Use [textLayer]="true" to enable the find button.');
                        }
                    }
                    if (this.showHandToolButton) {
                        if (this.logLevel >= VerbosityLevel.WARNINGS) {
                            console.warn(
                            // tslint:disable-next-line:max-line-length
                            'Hiding the "hand tool / selection mode" menu because the text layer of the PDF file is not rendered. Use [textLayer]="true" to enable the the menu items.');
                            this.showHandToolButton = false;
                        }
                    }
                }
            }
        }
        else {
            setTextLayerMode(pdfDefaultOptions.textLayerMode);
            this.textLayer = true;
            if (this.showFindButton === undefined) {
                this.showFindButton = true;
                setTimeout(() => {
                    this.toggleVisibility('viewFind');
                    this.toggleVisibility('findbar');
                });
            }
        }
    }
    async overrideDefaultSettings() {
        if (typeof window === 'undefined') {
            return; // server side rendering
        }
        const options = this.pdfScriptLoaderService.PDFViewerApplicationOptions;
        // tslint:disable-next-line:forin
        const optionsToIgnore = [
            'needsES5',
            'rangeChunkSize',
            '_internalFilenameSuffix',
            'assetsFolder',
            'doubleTapZoomFactor',
            'doubleTapZoomsInHandMode',
            'doubleTapZoomsInTextSelectionMode',
            'doubleTapResetsZoomOnSecondDoubleTap',
        ];
        for (const key in pdfDefaultOptions) {
            if (!optionsToIgnore.includes(key)) {
                const option = pdfDefaultOptions[key];
                if (key !== 'findController' && typeof option === 'function') {
                    options.set(key, option());
                }
                else {
                    options.set(key, pdfDefaultOptions[key]);
                }
            }
        }
        options.set('disablePreferences', true);
        await this.setZoom();
        this.keyboardManager.ignoreKeyboard = this.ignoreKeyboard;
        this.keyboardManager.ignoreKeys = this.ignoreKeys;
        this.keyboardManager.acceptKeys = this.acceptKeys;
        this.activateTextlayerIfNecessary(options);
        if (this.scrollMode || this.scrollMode === ScrollModeType.vertical) {
            options.set('scrollModeOnLoad', this.scrollMode);
        }
        const sidebarVisible = this.sidebarVisible;
        const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
        if (sidebarVisible !== undefined) {
            PDFViewerApplication.sidebarViewOnLoad = sidebarVisible ? 1 : 0;
            if (PDFViewerApplication.appConfig) {
                PDFViewerApplication.appConfig.sidebarViewOnLoad = sidebarVisible ? this.activeSidebarView : PdfSidebarView.NONE;
            }
            options.set('sidebarViewOnLoad', this.sidebarVisible ? this.activeSidebarView : 0);
        }
        if (this.spread === 'even') {
            options.set('spreadModeOnLoad', 2);
            if (PDFViewerApplication.pdfViewer) {
                PDFViewerApplication.pdfViewer.spreadMode = 2;
            }
            this.onSpreadChange('even');
        }
        else if (this.spread === 'odd') {
            options.set('spreadModeOnLoad', 1);
            if (PDFViewerApplication.pdfViewer) {
                PDFViewerApplication.pdfViewer.spreadMode = 1;
            }
            this.onSpreadChange('odd');
        }
        else {
            options.set('spreadModeOnLoad', 0);
            if (PDFViewerApplication.pdfViewer) {
                PDFViewerApplication.pdfViewer.spreadMode = 0;
            }
            this.onSpreadChange('off');
        }
        if (this.printResolution) {
            options.set('printResolution', this.printResolution);
        }
        if (this.showBorders === false) {
            options.set('removePageBorders', !this.showBorders);
        }
        const PDFViewerApplicationOptions = this.pdfScriptLoaderService.PDFViewerApplicationOptions;
        PDFViewerApplicationOptions.set('localeProperties', { lang: this.language });
    }
    async openPDF() {
        const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
        PDFViewerApplication.serviceWorkerOptions.showUnverifiedSignatures = this.showUnverifiedSignatures;
        PDFViewerApplication.enablePrint = this.enablePrint;
        if (this.filenameForDownload) {
            PDFViewerApplication.appConfig.filenameForDownload = this.filenameForDownload;
        }
        else {
            PDFViewerApplication.appConfig.filenameForDownload = this.guessFilenameFromUrl(this._src);
        }
        this.service.ngxExtendedPdfViewerInitialized = true;
        this.registerEventListeners(PDFViewerApplication);
        this.selectCursorTool();
        if (!this.listenToURL) {
            PDFViewerApplication.pdfLinkService.setHash = undefined;
        }
        if (this._src) {
            this.pdfScriptLoaderService.ngxExtendedPdfViewerIncompletelyInitialized = false;
            setTimeout(async () => this.dynamicCSSComponent.checkHeight(this, this.logLevel), 100);
            // open a file in the viewer
            if (!!this._src) {
                let workerSrc = pdfDefaultOptions.workerSrc;
                if (typeof workerSrc === 'function') {
                    workerSrc = workerSrc();
                }
                const options = {
                    password: this.password,
                    verbosity: this.logLevel,
                    workerSrc,
                };
                if (this._src['range']) {
                    options.range = this._src['range'];
                }
                if (this.httpHeaders) {
                    options.httpHeaders = this.httpHeaders;
                }
                if (this.authorization) {
                    options.withCredentials = true;
                    if (typeof this.authorization != 'boolean') {
                        if (!options.httpHeaders)
                            options.httpHeaders = {};
                        options.httpHeaders.Authorization = this.authorization;
                    }
                }
                options.baseHref = this.baseHref;
                PDFViewerApplication.onError = (error) => this.pdfLoadingFailed.emit(error);
                if (typeof this._src === 'string') {
                    options.url = this._src;
                }
                else if (this._src instanceof ArrayBuffer) {
                    options.data = this._src;
                }
                else if (this._src instanceof Uint8Array) {
                    options.data = this._src;
                }
                options.rangeChunkSize = pdfDefaultOptions.rangeChunkSize;
                options.cspPolicyService = this.cspPolicyService;
                PDFViewerApplication.findBar?.close();
                PDFViewerApplication.secondaryToolbar?.close();
                PDFViewerApplication.eventBus.dispatch('annotationeditormodechanged', { mode: 0 });
                await PDFViewerApplication.open(options);
                this.pdfLoadingStarts.emit({});
                setTimeout(async () => this.setZoom());
            }
            setTimeout(() => {
                if (!this.pdfScriptLoaderService.shuttingDown) {
                    // hurried users sometimes reload the PDF before it has finished initializing
                    if (this.page) {
                        PDFViewerApplication.page = Number(this.page);
                    }
                }
            }, 100);
        }
    }
    registerEventListeners(PDFViewerApplication) {
        PDFViewerApplication.eventBus.on('annotation-editor-event', (x) => {
            queueMicrotask(() => {
                this.annotationEditorEvent.emit(x);
            });
        });
        PDFViewerApplication.eventBus.on('toggleSidebar', (x) => {
            queueMicrotask(() => {
                this.sidebarVisible = x.visible;
                this.sidebarVisibleChange.emit(x.visible);
            });
        });
        PDFViewerApplication.eventBus.on('textlayerrendered', (x) => {
            queueMicrotask(() => this.textLayerRendered.emit(x));
        });
        PDFViewerApplication.eventBus.on('annotationeditormodechanged', (x) => {
            // we're using a timeout here to make sure the editor is already visible
            // when the event is caught. Pdf.js fires it a bit early.
            setTimeout(() => this.annotationEditorModeChanged.emit(x));
        });
        PDFViewerApplication.eventBus.on('scrollmodechanged', (x) => {
            queueMicrotask(() => {
                this._scrollMode = x.mode;
                this.scrollModeChange.emit(x.mode);
                if (x.mode === ScrollModeType.page) {
                    if (this.pageViewMode !== 'single') {
                        this.pageViewModeChange.emit('single');
                        this._pageViewMode = 'single';
                    }
                }
            });
        });
        PDFViewerApplication.eventBus.on('progress', (x) => {
            queueMicrotask(() => this.progress.emit(x));
        });
        PDFViewerApplication.eventBus.on('findbarclose', () => {
            queueMicrotask(() => {
                this.findbarVisible = false;
                this.findbarVisibleChange.emit(false);
                this.cdr.markForCheck();
            });
        });
        PDFViewerApplication.eventBus.on('findbaropen', () => {
            queueMicrotask(() => {
                this.findbarVisible = true;
                this.findbarVisibleChange.emit(true);
                this.cdr.markForCheck();
            });
        });
        PDFViewerApplication.eventBus.on('propertiesdialogclose', () => {
            this.propertiesDialogVisible = false;
            queueMicrotask(() => this.propertiesDialogVisibleChange.emit(false));
        });
        PDFViewerApplication.eventBus.on('propertiesdialogopen', () => {
            this.propertiesDialogVisible = true;
            queueMicrotask(() => this.propertiesDialogVisibleChange.emit(true));
        });
        PDFViewerApplication.eventBus.on('pagesloaded', (x) => {
            queueMicrotask(() => this.pagesLoaded.emit(x));
            this.dynamicCSSComponent.removeScrollbarInInfiniteScrollMode(false, this.pageViewMode, this.primaryMenuVisible, this, this.logLevel);
            if (this.rotation !== undefined && this.rotation !== null) {
                const r = Number(this.rotation);
                if (r === 0 || r === 90 || r === 180 || r === 270) {
                    PDFViewerApplication.pdfViewer.pagesRotation = r;
                }
            }
            setTimeout(() => {
                if (!this.pdfScriptLoaderService.shuttingDown) {
                    // hurried users sometimes reload the PDF before it has finished initializing
                    if (this.nameddest) {
                        PDFViewerApplication.pdfLinkService.goToDestination(this.nameddest);
                    }
                    else if (this.page) {
                        PDFViewerApplication.page = Number(this.page);
                    }
                    else if (this.pageLabel) {
                        PDFViewerApplication.pdfViewer.currentPageLabel = this.pageLabel;
                    }
                }
            });
            this.setZoom();
        });
        PDFViewerApplication.eventBus.on('pagerendered', (x) => {
            queueMicrotask(() => {
                this.pageRendered.emit(x);
                this.dynamicCSSComponent.removeScrollbarInInfiniteScrollMode(false, this.pageViewMode, this.primaryMenuVisible, this, this.logLevel);
            });
        });
        PDFViewerApplication.eventBus.on('pagerender', (x) => {
            queueMicrotask(() => {
                this.pageRender.emit(x);
            });
        });
        PDFViewerApplication.eventBus.on('download', (x) => {
            queueMicrotask(() => {
                this.pdfDownloaded.emit(x);
            });
        });
        PDFViewerApplication.eventBus.on('scalechanging', (x) => {
            setTimeout(() => {
                this.currentZoomFactor.emit(x.scale);
                this.cdr.markForCheck();
            });
            if (x.presetValue !== 'auto' && x.presetValue !== 'page-fit' && x.presetValue !== 'page-actual' && x.presetValue !== 'page-width') {
                // ignore rounding differences
                if (Math.abs(x.previousScale - x.scale) > 0.000001) {
                    this.zoom = x.scale * 100;
                    this.zoomChange.emit(x.scale * 100);
                }
            }
            else if (x.previousPresetValue !== x.presetValue) {
                // called when the user selects one of the text values of the zoom select dropdown
                this.zoomChange.emit(x.presetValue);
            }
        });
        PDFViewerApplication.eventBus.on('rotationchanging', (x) => {
            queueMicrotask(() => {
                this.rotationChange.emit(x.pagesRotation);
            });
        });
        PDFViewerApplication.eventBus.on('fileinputchange', (x) => {
            queueMicrotask(() => {
                if (x.fileInput.files && x.fileInput.files.length >= 1) {
                    // drag and drop
                    this.srcChangeTriggeredByUser = true;
                    this.srcChange.emit(x.fileInput.files[0].name);
                }
                else {
                    // regular file open dialog
                    const path = x.fileInput?.value?.replace('C:\\fakepath\\', '');
                    this.srcChange.emit(path);
                }
            });
        });
        PDFViewerApplication.eventBus.on('cursortoolchanged', (x) => {
            queueMicrotask(() => {
                this.handTool = x.tool === PdfCursorTools.HAND;
                this.handToolChange.emit(x.tool === PdfCursorTools.HAND);
            });
        });
        PDFViewerApplication.eventBus.on('sidebarviewchanged', (x) => {
            queueMicrotask(() => {
                this.sidebarVisibleChange.emit(x.view > 0);
                if (x.view > 0) {
                    this.activeSidebarViewChange.emit(x.view);
                }
                if (this.sidebarComponent) {
                    this.sidebarComponent.showToolbarWhenNecessary();
                }
            });
        });
        PDFViewerApplication.eventBus.on('documentloaded', (pdfLoadedEvent) => {
            queueMicrotask(async () => {
                const pages = pdfLoadedEvent.source.pagesCount;
                this.pageLabel = undefined;
                if (this.page && this.page >= pages) {
                    this.page = pages;
                }
                this.scrollSignatureWarningIntoView(pdfLoadedEvent.source.pdfDocument);
                this.pdfLoaded.emit({ pagesCount: pdfLoadedEvent.source.pdfDocument?.numPages });
                if (this.findbarVisible) {
                    PDFViewerApplication.findBar.open();
                }
                if (this.propertiesDialogVisible) {
                    PDFViewerApplication.pdfDocumentProperties.open();
                }
                this.hasTextLayer = this.textLayer === true;
            });
        });
        PDFViewerApplication.eventBus.on('spreadmodechanged', (event) => {
            queueMicrotask(() => {
                const modes = ['off', 'odd', 'even'];
                this.spread = modes[event.mode];
                this.spreadChange.emit(this.spread);
            });
        });
        const hideSidebarToolbar = () => {
            queueMicrotask(() => {
                if (this.sidebarComponent) {
                    this.sidebarComponent.showToolbarWhenNecessary();
                }
            });
        };
        PDFViewerApplication.eventBus.on('outlineloaded', hideSidebarToolbar);
        PDFViewerApplication.eventBus.on('attachmentsloaded', hideSidebarToolbar);
        PDFViewerApplication.eventBus.on('layersloaded', hideSidebarToolbar);
        PDFViewerApplication.eventBus.on('annotationlayerrendered', (event) => {
            const div = event.source.div;
            queueMicrotask(() => {
                event.initialFormDataStoredInThePDF = this.formSupport.initialFormDataStoredInThePDF;
                this.annotationLayerRendered.emit(event);
                this.enableOrDisableForms(div, true);
            });
        });
        PDFViewerApplication.eventBus.on('annotationeditorlayerrendered', (event) => queueMicrotask(() => this.annotationEditorLayerRendered.emit(event)));
        PDFViewerApplication.eventBus.on('xfalayerrendered', (event) => queueMicrotask(() => this.xfaLayerRendered.emit(event)));
        PDFViewerApplication.eventBus.on('outlineloaded', (event) => queueMicrotask(() => this.outlineLoaded.emit(event)));
        PDFViewerApplication.eventBus.on('attachmentsloaded', (event) => queueMicrotask(() => this.attachmentsloaded.emit(event)));
        PDFViewerApplication.eventBus.on('layersloaded', (event) => queueMicrotask(() => this.layersloaded.emit(event)));
        PDFViewerApplication.eventBus.on('presentationmodechanged', (event) => {
            const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
            PDFViewerApplication?.pdfViewer?.destroyBookMode();
        });
        PDFViewerApplication.eventBus.on('updatefindcontrolstate', (x) => {
            queueMicrotask(() => {
                let type = PDFViewerApplication.findController.state?.type ?? 'find';
                if (type === 'again') {
                    type = 'findagain';
                }
                const result = {
                    caseSensitive: PDFViewerApplication.findController.state?.caseSensitive,
                    entireWord: PDFViewerApplication.findController.state?.entireWord,
                    findPrevious: PDFViewerApplication.findController.state?.findPrevious,
                    highlightAll: PDFViewerApplication.findController.state?.highlightAll,
                    matchDiacritics: PDFViewerApplication.findController.state?.matchDiacritics,
                    query: PDFViewerApplication.findController.state?.query,
                    type,
                };
                this.updateFindMatchesCount.emit({
                    ...result,
                    current: x.matchesCount.current,
                    total: x.matchesCount.total,
                    matches: PDFViewerApplication.findController._pageMatches ?? [],
                    matchesLength: PDFViewerApplication.findController._pageMatchesLength ?? [],
                }); // TODO: remove the cast because it's just duct tape
                if (this.updateFindState) {
                    this.updateFindState.emit(x.state);
                }
            });
        });
        PDFViewerApplication.eventBus.on('updatefindmatchescount', (x) => {
            x.matchesCount.matches = PDFViewerApplication.findController._pageMatches ?? [];
            x.matchesCount.matchesLength = PDFViewerApplication.findController._pageMatchesLength ?? [];
            queueMicrotask(() => this.updateFindMatchesCount.emit({
                caseSensitive: PDFViewerApplication.findController.state?.caseSensitive ?? false,
                entireWord: PDFViewerApplication.findController.state?.entireWord ?? false,
                findPrevious: PDFViewerApplication.findController.state?.findPrevious ?? false,
                highlightAll: PDFViewerApplication.findController.state?.highlightAll ?? false,
                matchDiacritics: PDFViewerApplication.findController.state?.matchDiacritics ?? false,
                query: PDFViewerApplication.findController.state?.query ?? '',
                type: PDFViewerApplication.findController.state?.type,
                current: x.matchesCount.current,
                total: x.matchesCount.total,
                matches: x.matchesCount.matches,
                matchesLength: x.matchesCount.matchesLength,
            }));
        });
        PDFViewerApplication.eventBus.on('pagechanging', (x) => {
            if (!this.pdfScriptLoaderService.shuttingDown) {
                // hurried users sometimes reload the PDF before it has finished initializing
                queueMicrotask(() => {
                    const currentPage = PDFViewerApplication.pdfViewer.currentPageNumber;
                    const currentPageLabel = PDFViewerApplication.pdfViewer.currentPageLabel;
                    if (currentPage !== this.page) {
                        this.pageChange.emit(currentPage);
                    }
                    if (currentPageLabel !== this.pageLabel) {
                        this.pageLabelChange.emit(currentPageLabel);
                    }
                });
            }
        });
    }
    async openPDF2() {
        const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
        PDFViewerApplication.findBar?.close();
        PDFViewerApplication.secondaryToolbar?.close();
        try {
            // sometimes the annotation editor UI is undefined, but it's a private variable,
            // so we simply catch the error
            PDFViewerApplication.eventBus.dispatch('switchannotationeditormode', { mode: 0 });
        }
        catch (e) {
            // ignore this error
        }
        this.overrideDefaultSettings();
        PDFViewerApplication.pdfViewer.destroyBookMode();
        PDFViewerApplication.pdfViewer.stopRendering();
        PDFViewerApplication.pdfThumbnailViewer.stopRendering();
        // #802 clear the form data; otherwise the "download" dialogs opens
        PDFViewerApplication.pdfDocument?.annotationStorage?.resetModified();
        await PDFViewerApplication.close();
        this.formSupport?.reset();
        if (this.initialAngularFormData) {
            this.formSupport.formData = this.initialAngularFormData;
        }
        if (this.filenameForDownload) {
            PDFViewerApplication.appConfig.filenameForDownload = this.filenameForDownload;
        }
        else {
            PDFViewerApplication.appConfig.filenameForDownload = this.guessFilenameFromUrl(this._src);
        }
        let workerSrc = pdfDefaultOptions.workerSrc;
        if (typeof workerSrc === 'function') {
            workerSrc = workerSrc();
        }
        const options = {
            password: this.password,
            verbosity: this.logLevel,
            workerSrc,
        };
        if (this._src?.['range']) {
            options.range = this._src['range'];
        }
        if (this.httpHeaders) {
            options.httpHeaders = this.httpHeaders;
        }
        if (this.authorization) {
            options.withCredentials = true;
            if (typeof this.authorization != 'boolean') {
                if (!options.httpHeaders)
                    options.httpHeaders = {};
                options.httpHeaders.Authorization = this.authorization;
            }
        }
        options.baseHref = this.baseHref;
        try {
            if (typeof this._src === 'string') {
                options.url = this._src;
            }
            else if (this._src instanceof ArrayBuffer) {
                options.data = this._src;
                if (this._src.byteLength === 0) {
                    // sometimes ngOnInit() calls openPdf2 too early
                    // so let's ignore empty arrays
                    return;
                }
            }
            else if (this._src instanceof Uint8Array) {
                options.data = this._src;
                if (this._src.length === 0) {
                    // sometimes ngOnInit() calls openPdf2 too early
                    // so let's ignore empty arrays
                    return;
                }
            }
            options.rangeChunkSize = pdfDefaultOptions.rangeChunkSize;
            await PDFViewerApplication.open(options);
        }
        catch (error) {
            this.pdfLoadingFailed.emit(error);
        }
    }
    selectCursorTool() {
        const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
        PDFViewerApplication.eventBus.dispatch('switchcursortool', { tool: this.handTool ? 1 : 0 });
    }
    doReplaceBrowserPrint(useCustomPrintOfPdfJS) {
        if (useCustomPrintOfPdfJS) {
            const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
            if (PDFViewerApplication?.printPdf) {
                window.print = PDFViewerApplication.printPdf.bind(PDFViewerApplication);
            }
        }
        else if (this.originalPrint && !this.originalPrint.toString().includes('printPdf')) {
            window.print = this.originalPrint;
        }
    }
    async ngOnDestroy() {
        this.destroyInitialization = true;
        if (this.checkRootElementTimeout) {
            clearTimeout(this.checkRootElementTimeout);
        }
        if (this.initializationPromise) {
            try {
                await this.initializationPromise;
            }
            catch (e) {
            }
        }
        this.notificationService.onPDFJSInitSignal.set(undefined);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        // do not run this code on the server
        if (typeof window !== 'undefined') {
            const pc = document.getElementById('printContainer');
            if (pc) {
                pc.remove();
            }
        }
        // do not run this code on the server
        if (typeof window !== 'undefined') {
            const originalPrint = this.originalPrint;
            if (window && originalPrint && !originalPrint.toString().includes('printPdf')) {
                window.print = originalPrint;
            }
        }
        const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
        if (PDFViewerApplication) {
            if (PDFViewerApplication.ngxConsole) {
                PDFViewerApplication.ngxConsole.reset();
            }
            PDFViewerApplication.pdfViewer?.destroyBookMode();
            PDFViewerApplication.pdfViewer?.stopRendering();
            PDFViewerApplication.pdfThumbnailViewer?.stopRendering();
            delete PDFViewerApplication.ngxKeyboardManager;
            delete PDFViewerApplication.cspPolicyService;
            PDFViewerApplication.eventBus?.off('afterprint', this.afterPrintListener);
            PDFViewerApplication.eventBus?.off('beforeprint', this.beforePrintListener);
            PDFViewerApplication.eventBus?.off('sourcechanged', this.reportSourceChanges.bind(this));
            // #802 clear the form data; otherwise the "download" dialogs opens
            PDFViewerApplication.pdfDocument?.annotationStorage?.resetModified();
            this.formSupport?.reset();
            this.formSupport = undefined;
            PDFViewerApplication.onError = undefined;
            try {
                await PDFViewerApplication.close();
            }
            catch (error) {
                // just ignore it
                // for example, the secondary toolbar may have not been initialized yet, so
                // trying to destroy it result in errors
            }
            if (PDFViewerApplication.printKeyDownListener) {
                removeEventListener('keydown', PDFViewerApplication.printKeyDownListener, true);
            }
            const w = globalThis;
            delete w.getFormValueFromAngular;
            delete w.registerAcroformAnnotations;
            delete w.getFormValue;
            delete w.setFormValue;
            delete w.assignFormIdAndFieldName;
            delete w.registerAcroformField;
            delete w.registerXFAField;
            delete w.assignFormIdAndFieldName;
            delete w.updateAngularFormValue;
            const bus = PDFViewerApplication.eventBus;
            if (bus) {
                PDFViewerApplication.unbindEvents();
                bus.destroy();
            }
            PDFViewerApplication.unbindWindowEvents();
            PDFViewerApplication?._cleanup();
            PDFViewerApplication.eventBus = undefined;
            delete w.PDFViewerApplication;
            delete w.PDFViewerApplicationOptions;
            delete w.PDFViewerApplicationConstants;
            this.service.ngxExtendedPdfViewerInitialized = false;
            // do not run this code on the server
            if (typeof window !== 'undefined') {
                document.querySelectorAll('.ngx-extended-pdf-viewer-file-input').forEach((e) => {
                    e.remove();
                });
            }
        }
    }
    isPrimaryMenuVisible() {
        if (this.showToolbar) {
            const visible = this.showDownloadButton ||
                this.showDrawEditor ||
                this.showHighlightEditor ||
                this.showTextEditor ||
                this.showFindButton ||
                this.showOpenFileButton ||
                this.showPagingButtons ||
                this.showPresentationModeButton ||
                this.showPrintButton ||
                this.showPropertiesButton ||
                this.showRotateCwButton ||
                this.showRotateCcwButton ||
                this.showHandToolButton ||
                this.showBookModeButton ||
                this.showSinglePageModeButton ||
                this.showVerticalScrollButton ||
                this.showHorizontalScrollButton ||
                this.showInfiniteScrollButton ||
                this.showSpreadButton ||
                this.showSidebarButton ||
                this.showZoomButtons;
            if (visible) {
                return true;
            }
        }
        return false;
    }
    async ngOnChanges(changes) {
        if (typeof window === 'undefined') {
            return; // server side rendering
        }
        const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
        const PDFViewerApplicationOptions = this.pdfScriptLoaderService.PDFViewerApplicationOptions;
        if (this.service.ngxExtendedPdfViewerInitialized) {
            if ('src' in changes || 'base64Src' in changes) {
                if (this.srcChangeTriggeredByUser) {
                    this.srcChangeTriggeredByUser = false;
                }
                else {
                    if (this.pageViewMode === 'book') {
                        const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
                        PDFViewerApplication?.pdfViewer?.destroyBookMode();
                        PDFViewerApplication?.pdfViewer?.stopRendering();
                        PDFViewerApplication?.pdfThumbnailViewer?.stopRendering();
                    }
                    if (!!this._src) {
                        if (this.pdfScriptLoaderService.ngxExtendedPdfViewerIncompletelyInitialized) {
                            this.openPDF();
                        }
                        else {
                            const initialized = this.notificationService.onPDFJSInitSignal();
                            if (initialized) {
                                await this.openPDF2();
                            }
                            else {
                                // the library loads the PDF file later during the initialization
                            }
                        }
                    }
                    else {
                        // #802 clear the form data; otherwise the "download" dialogs opens
                        await this.closeDocument(PDFViewerApplication);
                    }
                }
            }
            if ('enableDragAndDrop' in changes) {
                PDFViewerApplicationOptions.set('enableDragAndDrop', this.enableDragAndDrop);
            }
            if ('findbarVisible' in changes) {
                if (changes['findbarVisible'].currentValue) {
                    PDFViewerApplication.findBar.open();
                }
                else {
                    PDFViewerApplication.findBar.close();
                }
            }
            if ('propertiesDialogVisible' in changes) {
                if (this.propertiesDialogVisible) {
                    PDFViewerApplication.pdfDocumentProperties.open();
                }
                else {
                    PDFViewerApplication.pdfDocumentProperties.close();
                }
            }
            if ('zoom' in changes) {
                await this.setZoom();
            }
            if ('maxZoom' in changes) {
                if (PDFViewerApplication.pdfViewer) {
                    PDFViewerApplication.pdfViewer.maxZoom = this.maxZoom;
                }
                if (PDFViewerApplication.toolbar) {
                    PDFViewerApplication.toolbar.maxZoom = this.maxZoom;
                }
            }
            if ('minZoom' in changes) {
                if (PDFViewerApplication.pdfViewer) {
                    PDFViewerApplication.pdfViewer.minZoom = this.minZoom;
                }
                if (PDFViewerApplication.toolbar) {
                    PDFViewerApplication.toolbar.minZoom = this.minZoom;
                }
            }
            if ('handTool' in changes) {
                this.selectCursorTool();
            }
            if ('page' in changes) {
                if (this.page) {
                    // tslint:disable-next-line: triple-equals
                    if (this.page != PDFViewerApplication.page) {
                        PDFViewerApplication.page = this.page;
                    }
                }
            }
            if ('pageLabel' in changes) {
                if (this.pageLabel) {
                    if (this.pageLabel !== PDFViewerApplication.pdfViewer.currentPageLabel) {
                        PDFViewerApplication.pdfViewer.currentPageLabel = this.pageLabel;
                    }
                }
            }
            if ('rotation' in changes) {
                if (this.rotation) {
                    const r = Number(this.rotation);
                    if (r === 0 || r === 90 || r === 180 || r === 270) {
                        PDFViewerApplication.pdfViewer.pagesRotation = r;
                    }
                }
                else {
                    PDFViewerApplication.pdfViewer.pagesRotation = 0;
                }
            }
            if ('scrollMode' in changes) {
                if (this.scrollMode || this.scrollMode === ScrollModeType.vertical) {
                    if (PDFViewerApplication.pdfViewer.scrollMode !== Number(this.scrollMode)) {
                        PDFViewerApplication.eventBus.dispatch('switchscrollmode', { mode: Number(this.scrollMode) });
                    }
                }
            }
            if ('activeSidebarView' in changes) {
                if (this.sidebarVisible) {
                    PDFViewerApplication.pdfSidebar.open();
                    const view = Number(this.activeSidebarView);
                    if (view === 1 || view === 2 || view === 3 || view === 4) {
                        PDFViewerApplication.pdfSidebar.switchView(view, true);
                    }
                    else {
                        console.error('[activeSidebarView] must be an integer value between 1 and 4');
                    }
                }
                else {
                    PDFViewerApplication.pdfSidebar.close();
                }
            }
            if ('filenameForDownload' in changes) {
                PDFViewerApplication.appConfig.filenameForDownload = this.filenameForDownload;
            }
            if ('nameddest' in changes) {
                if (this.nameddest) {
                    PDFViewerApplication.pdfLinkService.goToDestination(this.nameddest);
                }
            }
            if ('spread' in changes) {
                if (this.spread === 'even') {
                    PDFViewerApplication.spreadModeOnLoad = 2;
                    PDFViewerApplication.pdfViewer.spreadMode = 2;
                    this.onSpreadChange('even');
                }
                else if (this.spread === 'odd') {
                    PDFViewerApplication.spreadModeOnLoad = 1;
                    PDFViewerApplication.pdfViewer.spreadMode = 1;
                    this.onSpreadChange('odd');
                }
                else {
                    PDFViewerApplication.spreadModeOnLoad = 0;
                    PDFViewerApplication.pdfViewer.spreadMode = 0;
                    this.onSpreadChange('off');
                }
            }
            this.hideToolbarIfItIsEmpty();
            setTimeout(() => this.calcViewerPositionTop());
        } // end of if (NgxExtendedPdfViewerComponent.ngxExtendedPdfViewerInitialized)
        if ('printResolution' in changes) {
            const options = PDFViewerApplicationOptions;
            if (options) {
                options.set('printResolution', this.printResolution);
            }
        }
        if ('ignoreKeyboard' in changes) {
            const options = PDFViewerApplicationOptions;
            if (options) {
                this.overrideDefaultSettings();
            }
        }
        if ('ignoreKeys' in changes) {
            const options = PDFViewerApplicationOptions;
            if (options) {
                this.overrideDefaultSettings();
            }
        }
        if ('acceptKeys' in changes) {
            const options = PDFViewerApplicationOptions;
            if (options) {
                this.overrideDefaultSettings();
            }
        }
        if ('showBorders' in changes) {
            if (!changes['showBorders'].isFirstChange()) {
                const options = PDFViewerApplicationOptions;
                if (options) {
                    this.overrideDefaultSettings();
                    const viewer = document.getElementById('viewer');
                    if (this.showBorders) {
                        viewer.classList.remove('removePageBorders');
                    }
                    else {
                        viewer.classList.add('removePageBorders');
                    }
                    if (PDFViewerApplication.pdfViewer) {
                        PDFViewerApplication.pdfViewer.removePageBorders = !this.showBorders;
                    }
                    const zoomEvent = {
                        source: viewer,
                        // tslint:disable-next-line:no-bitwise
                        scale: (Number(this.zoom) | 100) / 100,
                        presetValue: this.zoom,
                    };
                    PDFViewerApplication.eventBus.dispatch('scalechanging', zoomEvent);
                }
            }
        }
        if ('showUnverifiedSignatures' in changes) {
            if (PDFViewerApplication?.pdfDocument) {
                PDFViewerApplication.pdfDocument._transport.messageHandler.send('showUnverifiedSignatures', this.showUnverifiedSignatures);
            }
        }
        if ('formData' in changes) {
            if (!changes['formData'].isFirstChange()) {
                this.formSupport.updateFormFieldsInPdfCalledByNgOnChanges(changes['formData'].previousValue);
            }
        }
        if ('enablePrint' in changes) {
            if (!changes['enablePrint'].isFirstChange()) {
                PDFViewerApplication.enablePrint = this.enablePrint;
            }
        }
        if (('customFindbar' in changes && !changes['customFindbar'].isFirstChange()) ||
            ('customFindbarButtons' in changes && !changes['customFindbarButtons'].isFirstChange()) ||
            ('customFindbarInputArea' in changes && !changes['customFindbarInputArea'].isFirstChange()) ||
            ('customToolbar' in changes && !changes['customToolbar'].isFirstChange())) {
            if (this.dummyComponents) {
                this.dummyComponents.addMissingStandardWidgets();
            }
        }
        if ('pageViewMode' in changes && !changes['pageViewMode'].isFirstChange()) {
            this.pageViewMode = changes['pageViewMode'].currentValue;
        }
        if ('replaceBrowserPrint' in changes && typeof window !== 'undefined') {
            this.doReplaceBrowserPrint(this.replaceBrowserPrint);
        }
        if ('disableForms' in changes) {
            this.enableOrDisableForms(this.elementRef.nativeElement, false);
        }
        setTimeout(() => this.calcViewerPositionTop());
    }
    async closeDocument(PDFViewerApplication) {
        if (this.pageViewMode === 'book') {
            const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
            PDFViewerApplication?.pdfViewer?.destroyBookMode();
            PDFViewerApplication?.pdfViewer?.stopRendering();
            PDFViewerApplication?.pdfThumbnailViewer?.stopRendering();
        }
        PDFViewerApplication.pdfDocument?.annotationStorage?.resetModified();
        this.formSupport?.reset();
        let inputField = PDFViewerApplication.appConfig?.openFileInput;
        if (!inputField) {
            inputField = document.querySelector('#fileInput');
        }
        if (inputField) {
            inputField.value = '';
        }
        await PDFViewerApplication.close();
    }
    async setZoom() {
        if (typeof window === 'undefined') {
            return; // server side rendering
        }
        // sometimes ngOnChanges calls this method before the page is initialized,
        // so let's check if this.root is already defined
        if (this.root) {
            const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
            let zoomAsNumber = this.zoom;
            if (String(zoomAsNumber).endsWith('%')) {
                zoomAsNumber = Number(String(zoomAsNumber).replace('%', '')) / 100;
            }
            else if (!isNaN(Number(zoomAsNumber))) {
                zoomAsNumber = Number(zoomAsNumber) / 100;
            }
            if (!zoomAsNumber) {
                if (!PDFViewerApplication.store) {
                    // It's difficult to prevent calling this method to early, so we need this check.
                    // setZoom() is called later again, when the PDF document has been loaded and its
                    // fingerprint has been calculated.
                }
                else {
                    const userSetting = await PDFViewerApplication.store.get('zoom');
                    if (userSetting) {
                        if (!isNaN(Number(userSetting))) {
                            zoomAsNumber = Number(userSetting) / 100;
                        }
                        else {
                            zoomAsNumber = userSetting;
                        }
                    }
                    else {
                        zoomAsNumber = 'auto';
                    }
                }
            }
            if (PDFViewerApplication) {
                const PDFViewerApplicationOptions = this.pdfScriptLoaderService.PDFViewerApplicationOptions;
                PDFViewerApplicationOptions.set('defaultZoomValue', zoomAsNumber);
            }
            const scaleDropdownField = this.root.nativeElement.querySelector('#scaleSelect');
            if (scaleDropdownField) {
                if (this.zoom === 'auto' || this.zoom === 'page-fit' || this.zoom === 'page-actual' || this.zoom === 'page-width') {
                    scaleDropdownField.value = this.zoom;
                }
                else {
                    scaleDropdownField.value = 'custom';
                    if (scaleDropdownField.options) {
                        for (const option of scaleDropdownField.options) {
                            if (option.value === 'custom') {
                                option.textContent = `${Math.round(Number(zoomAsNumber) * 100000) / 1000}%`;
                            }
                        }
                    }
                }
            }
            if (PDFViewerApplication.pdfViewer) {
                PDFViewerApplication.pdfViewer.currentScaleValue = zoomAsNumber ?? 'auto';
            }
        }
    }
    initResizeObserver() {
        try {
            const viewer = document.getElementById('viewer');
            if (viewer) {
                this.resizeObserver = new ResizeObserver(() => {
                    this.onResize();
                });
                this.resizeObserver.observe(viewer);
            }
        }
        catch (exception) {
            console.log('ResizeObserver is not supported by your browser');
        }
    }
    onResize() {
        const pdfViewer = document.getElementsByClassName('html');
        if (pdfViewer && pdfViewer.length > 0) {
            const container = document.getElementById('outerContainer');
            if (container) {
                if (this.secondaryToolbarComponent) {
                    this.secondaryToolbarComponent.checkVisibility();
                }
                if (this.dynamicCSSComponent) {
                    this.dynamicCSSComponent.updateToolbarWidth();
                }
            }
            this.dynamicCSSComponent.checkHeight(this, this.logLevel);
        }
        this.dynamicCSSComponent.removeScrollbarInInfiniteScrollMode(false, this.pageViewMode, this.primaryMenuVisible, this, this.logLevel);
    }
    onContextMenu() {
        return this.contextMenuAllowed;
    }
    async pageHasVisibleSignature(page) {
        const annotations = await page.getAnnotations();
        const signature = annotations.find((a) => a.fieldType === 'Sig');
        if (signature) {
            const rect = signature?.rect;
            if (rect && rect.length === 4 && rect[2] - rect[0] > 0 && rect[3] - rect[1] > 0 && !signature.hidden) {
                return true;
            }
        }
        return false;
    }
    async scrollSignatureWarningIntoView(pdf) {
        /** This method has been inspired by https://medium.com/factory-mind/angular-pdf-forms-fa72b15c3fbd. Thanks, Jonny Fox! */
        this.hasSignature = false;
        for (let i = 1; i <= pdf?.numPages; i++) {
            // track the current page
            const page = await pdf.getPage(i);
            if (await this.pageHasVisibleSignature(page)) {
                this.hasSignature = true;
                break; // stop looping through the pages as soon as we find a signature
            }
        }
        if (this.hasSignature) {
            queueMicrotask(() => {
                // Defer scrolling to ensure it happens after any other UI updates
                setTimeout(() => {
                    const viewerContainer = document.querySelector('#viewerContainer');
                    viewerContainer?.scrollBy(0, -32); // Adjust the scroll position
                });
            });
        }
    }
    async zoomToPageWidth(event) {
        if (this.handTool) {
            if (!pdfDefaultOptions.doubleTapZoomsInHandMode) {
                return;
            }
        }
        else if (!pdfDefaultOptions.doubleTapZoomsInTextSelectionMode) {
            return;
        }
        if (this.pageViewMode === 'book') {
            // scaling doesn't work in book mode
            return;
        }
        const PDFViewerApplication = this.pdfScriptLoaderService.PDFViewerApplication;
        const desiredCenterY = event.clientY;
        const previousScale = PDFViewerApplication.pdfViewer.currentScale;
        if (this.zoom !== pdfDefaultOptions.doubleTapZoomFactor && this.zoom + '%' !== pdfDefaultOptions.doubleTapZoomFactor) {
            this.previousZoom = this.zoom;
            this.zoom = pdfDefaultOptions.doubleTapZoomFactor; // by default: 'page-width';
            await this.setZoom();
        }
        else if (pdfDefaultOptions.doubleTapResetsZoomOnSecondDoubleTap) {
            if (this.previousZoom) {
                this.zoom = this.previousZoom;
            }
            else {
                this.zoom = 'page-width';
            }
            await this.setZoom();
        }
        else {
            return;
        }
        const currentScale = PDFViewerApplication.pdfViewer.currentScale;
        const scaleCorrectionFactor = currentScale / previousScale - 1;
        const rect = PDFViewerApplication.pdfViewer.container.getBoundingClientRect();
        const dy = desiredCenterY - rect.top;
        PDFViewerApplication.pdfViewer.container.scrollTop += dy * scaleCorrectionFactor;
    }
    enableOrDisableForms(div, doNotEnable) {
        if (!this.disableForms && doNotEnable) {
            return;
        }
        const xfaLayers = Array.from(div.querySelectorAll('.xfaLayer'));
        const acroFormLayers = Array.from(div.querySelectorAll('.annotationLayer'));
        const layers = xfaLayers.concat(...acroFormLayers);
        layers.forEach((layer) => layer.querySelectorAll('input').forEach((x) => (x.disabled = this.disableForms)));
        layers.forEach((layer) => layer.querySelectorAll('select').forEach((x) => (x.disabled = this.disableForms)));
        layers.forEach((layer) => layer.querySelectorAll('textarea').forEach((x) => (x.disabled = this.disableForms)));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxExtendedPdfViewerComponent, deps: [{ token: PLATFORM_ID }, { token: i1.PDFNotificationService }, { token: i0.ElementRef }, { token: i2.PlatformLocation }, { token: i0.ChangeDetectorRef }, { token: i3.NgxExtendedPdfViewerService }, { token: i0.Renderer2 }, { token: i4.PDFScriptLoaderService }, { token: i5.NgxKeyboardManagerService }, { token: i6.PdfCspPolicyService }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "17.3.12", type: NgxExtendedPdfViewerComponent, selector: "ngx-extended-pdf-viewer", inputs: { customFindbarInputArea: "customFindbarInputArea", customToolbar: "customToolbar", customFindbar: "customFindbar", customFindbarButtons: "customFindbarButtons", customPdfViewer: "customPdfViewer", customSecondaryToolbar: "customSecondaryToolbar", customSidebar: "customSidebar", customThumbnail: "customThumbnail", customFreeFloatingBar: "customFreeFloatingBar", showFreeFloatingBar: "showFreeFloatingBar", enableDragAndDrop: "enableDragAndDrop", forceUsingLegacyES5: "forceUsingLegacyES5", formData: "formData", disableForms: "disableForms", pageViewMode: "pageViewMode", scrollMode: "scrollMode", authorization: "authorization", httpHeaders: "httpHeaders", contextMenuAllowed: "contextMenuAllowed", enablePrint: "enablePrint", enablePrintAutoRotate: "enablePrintAutoRotate", showTextEditor: "showTextEditor", showStampEditor: "showStampEditor", showDrawEditor: "showDrawEditor", showHighlightEditor: "showHighlightEditor", logLevel: "logLevel", relativeCoordsOptions: "relativeCoordsOptions", minifiedJSLibraries: "minifiedJSLibraries", printResolution: "printResolution", rotation: "rotation", src: "src", base64Src: "base64Src", minHeight: "minHeight", height: "height", backgroundColor: "backgroundColor", filenameForDownload: "filenameForDownload", ignoreKeyboard: "ignoreKeyboard", ignoreKeys: "ignoreKeys", acceptKeys: "acceptKeys", imageResourcesPath: "imageResourcesPath", localeFolderPath: "localeFolderPath", language: "language", listenToURL: "listenToURL", nameddest: "nameddest", password: "password", replaceBrowserPrint: "replaceBrowserPrint", useInlineScripts: "useInlineScripts", showUnverifiedSignatures: "showUnverifiedSignatures", startTabindex: "startTabindex", showSidebarButton: "showSidebarButton", sidebarVisible: "sidebarVisible", activeSidebarView: "activeSidebarView", findbarVisible: "findbarVisible", propertiesDialogVisible: "propertiesDialogVisible", showFindButton: "showFindButton", showFindHighlightAll: "showFindHighlightAll", showFindMatchCase: "showFindMatchCase", showFindMultiple: "showFindMultiple", showFindRegexp: "showFindRegexp", showFindEntireWord: "showFindEntireWord", showFindMatchDiacritics: "showFindMatchDiacritics", showFindResultsCount: "showFindResultsCount", showFindMessages: "showFindMessages", showPagingButtons: "showPagingButtons", showFirstAndLastPageButtons: "showFirstAndLastPageButtons", showPreviousAndNextPageButtons: "showPreviousAndNextPageButtons", showPageNumber: "showPageNumber", showPageLabel: "showPageLabel", showZoomButtons: "showZoomButtons", showZoomDropdown: "showZoomDropdown", showPresentationModeButton: "showPresentationModeButton", showOpenFileButton: "showOpenFileButton", showPrintButton: "showPrintButton", showDownloadButton: "showDownloadButton", theme: "theme", showToolbar: "showToolbar", showSecondaryToolbarButton: "showSecondaryToolbarButton", showSinglePageModeButton: "showSinglePageModeButton", showVerticalScrollButton: "showVerticalScrollButton", showHorizontalScrollButton: "showHorizontalScrollButton", showWrappedScrollButton: "showWrappedScrollButton", showInfiniteScrollButton: "showInfiniteScrollButton", showBookModeButton: "showBookModeButton", showRotateButton: "showRotateButton", showRotateCwButton: "showRotateCwButton", showRotateCcwButton: "showRotateCcwButton", handTool: "handTool", showHandToolButton: "showHandToolButton", showSpreadButton: "showSpreadButton", showPropertiesButton: "showPropertiesButton", showBorders: "showBorders", spread: "spread", showScrollingButtons: "showScrollingButtons", page: "page", pageLabel: "pageLabel", textLayer: "textLayer", zoom: "zoom", zoomLevels: "zoomLevels", maxZoom: "maxZoom", minZoom: "minZoom", mobileFriendlyZoom: "mobileFriendlyZoom" }, outputs: { annotationEditorEvent: "annotationEditorEvent", formDataChange: "formDataChange", pageViewModeChange: "pageViewModeChange", progress: "progress", srcChange: "srcChange", scrollModeChange: "scrollModeChange", afterPrint: "afterPrint", beforePrint: "beforePrint", currentZoomFactor: "currentZoomFactor", rotationChange: "rotationChange", annotationLayerRendered: "annotationLayerRendered", annotationEditorLayerRendered: "annotationEditorLayerRendered", xfaLayerRendered: "xfaLayerRendered", outlineLoaded: "outlineLoaded", attachmentsloaded: "attachmentsloaded", layersloaded: "layersloaded", sidebarVisibleChange: "sidebarVisibleChange", activeSidebarViewChange: "activeSidebarViewChange", findbarVisibleChange: "findbarVisibleChange", propertiesDialogVisibleChange: "propertiesDialogVisibleChange", handToolChange: "handToolChange", spreadChange: "spreadChange", thumbnailDrawn: "thumbnailDrawn", pageChange: "pageChange", pageLabelChange: "pageLabelChange", pagesLoaded: "pagesLoaded", pageRender: "pageRender", pageRendered: "pageRendered", pdfDownloaded: "pdfDownloaded", pdfLoaded: "pdfLoaded", pdfLoadingStarts: "pdfLoadingStarts", pdfLoadingFailed: "pdfLoadingFailed", textLayerRendered: "textLayerRendered", annotationEditorModeChanged: "annotationEditorModeChanged", updateFindMatchesCount: "updateFindMatchesCount", updateFindState: "updateFindState", zoomChange: "zoomChange" }, host: { listeners: { "contextmenu": "onContextMenu()" } }, viewQueries: [{ propertyName: "dummyComponents", first: true, predicate: PdfDummyComponentsComponent, descendants: true }, { propertyName: "root", first: true, predicate: ["root"], descendants: true }, { propertyName: "secondaryToolbarComponent", first: true, predicate: ["pdfSecondaryToolbarComponent"], descendants: true }, { propertyName: "dynamicCSSComponent", first: true, predicate: ["DynamicCssComponent"], descendants: true }, { propertyName: "sidebarComponent", first: true, predicate: ["pdfsidebar"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "@if (theme === 'dark') {\n<pdf-dark-theme></pdf-dark-theme>\n}\n@if (theme === 'light') {\n<pdf-light-theme></pdf-light-theme>\n}\n<pdf-acroform-default-theme></pdf-acroform-default-theme>\n\n<pdf-dynamic-css #DynamicCssComponent [zoom]=\"mobileFriendlyZoomScale\"></pdf-dynamic-css>\n<ng-content *ngTemplateOutlet=\"customPdfViewer ? customPdfViewer : defaultPdfViewer\"></ng-content>\n\n<ng-template #defaultPdfViewer>\n  <div class=\"zoom\" [style.height]=\"minHeight ? minHeight : height\" #root>\n    <div class=\"html\">\n      <div class=\"body pdf-js-version-{{ majorMinorPdfJsVersion }}\" [style.backgroundColor]=\"backgroundColor\">\n        <div id=\"outerContainer\">\n          @if (showFreeFloatingBar) {\n          <div class=\"free-floating-bar\">\n            <ng-content *ngTemplateOutlet=\"customFreeFloatingBar ? customFreeFloatingBar : defaultFreeFloatingBar\">\n            </ng-content>\n          </div>\n          }\n          <pdf-sidebar #pdfsidebar [sidebarVisible]=\"sidebarVisible || false\" [showSidebarButton]=\"showSidebarButton\"\n            [customSidebar]=\"customSidebar\" [customThumbnail]=\"customThumbnail\"\n            (thumbnailDrawn)=\"thumbnailDrawn.emit($event)\" [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\"\n            [sidebarPositionTop]=\"sidebarPositionTop\">\n          </pdf-sidebar>\n          <div id=\"mainContainer\" [class.toolbar-hidden]=\"!primaryMenuVisible\">\n            <pdf-dummy-components></pdf-dummy-components>\n\n            <pdf-toolbar (onToolbarLoaded)=\"onToolbarLoaded($event)\" [sidebarVisible]=\"sidebarVisible\"\n              [class.server-side-rendering]=\"serverSideRendering\" [customToolbar]=\"customToolbar\"\n              [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\" [(pageViewMode)]=\"pageViewMode\"\n              [primaryMenuVisible]=\"primaryMenuVisible\" [scrollMode]=\"scrollMode ?? 0\"\n              [showPropertiesButton]=\"showPropertiesButton\" [showBookModeButton]=\"showBookModeButton\"\n              [showDownloadButton]=\"showDownloadButton\" [showDrawEditor]=\"showDrawEditor\"\n              [showHighlightEditor]=\"showHighlightEditor\" [showFindButton]=\"showFindButton\"\n              [showHandToolButton]=\"showHandToolButton\" [handTool]=\"handTool\"\n              [showHorizontalScrollButton]=\"showHorizontalScrollButton\"\n              [showInfiniteScrollButton]=\"showInfiniteScrollButton\" [showOpenFileButton]=\"showOpenFileButton\"\n              [showPagingButtons]=\"showPagingButtons\" [showFirstAndLastPageButtons]=\"showFirstAndLastPageButtons\"\n              [showPreviousAndNextPageButtons]=\"showPreviousAndNextPageButtons\" [showPageNumber]=\"showPageNumber\"\n              [showPageLabel]=\"showPageLabel\"\n              [showPresentationModeButton]=\"showPresentationModeButton && pageViewMode !== 'book'\"\n              [showPrintButton]=\"enablePrint ? showPrintButton : false\" [showRotateCwButton]=\"showRotateCwButton\"\n              [showRotateCcwButton]=\"showRotateCcwButton\"\n              [showSecondaryToolbarButton]=\"showSecondaryToolbarButton && !service.secondaryMenuIsEmpty\"\n              [showSidebarButton]=\"showSidebarButton\" [showSinglePageModeButton]=\"showSinglePageModeButton\"\n              [showSpreadButton]=\"showSpreadButton\" [showStampEditor]=\"showStampEditor\"\n              [showTextEditor]=\"showTextEditor\" [showVerticalScrollButton]=\"showVerticalScrollButton\"\n              [showWrappedScrollButton]=\"showWrappedScrollButton\"\n              [showZoomButtons]=\"showZoomButtons && pageViewMode !== 'book'\" [showZoomDropdown]=\"showZoomDropdown\"\n              [spread]=\"spread\" [textLayer]=\"textLayer\" [toolbarMarginTop]=\"toolbarMarginTop\"\n              [toolbarWidth]=\"toolbarWidth\" [zoomLevels]=\"zoomLevels\" [findbarVisible]=\"findbarVisible\"\n              [hasTextLayer]=\"hasTextLayer\"></pdf-toolbar>\n\n            <div class=\"editorParamsToolbar hidden doorHangerRight\" id=\"editorHighlightParamsToolbar\">\n              <div id=\"highlightParamsToolbarContainer\" class=\"editorParamsToolbarContainer\">\n                <div id=\"editorHighlightColorPicker\" class=\"colorPicker\">\n                  <span id=\"highlightColorPickerLabel\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-highlight-colorpicker-label\">Highlight color</span>\n                </div>\n                <div id=\"editorHighlightThickness\">\n                  <label for=\"editorFreeHighlightThickness\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-free-highlight-thickness-input\">Thickness</label>\n                  <div class=\"thicknessPicker\">\n                    <input type=\"range\" id=\"editorFreeHighlightThickness\" class=\"editorParamsSlider\"\n                      data-l10n-id=\"pdfjs-editor-free-highlight-thickness-title\" value=\"12\" min=\"8\" max=\"24\" step=\"1\" />\n                  </div>\n                </div>\n                <div id=\"editorHighlightVisibility\">\n                  <div class=\"divider\"></div>\n                  <div class=\"toggler\">\n                    <label for=\"editorHighlightShowAll\" class=\"editorParamsLabel\"\n                      data-l10n-id=\"pdfjs-editor-highlight-show-all-button-label\">Show all</label>\n                    <button id=\"editorHighlightShowAll\" class=\"toggle-button\"\n                      data-l10n-id=\"pdfjs-editor-highlight-show-all-button\" aria-pressed=\"true\"></button>\n                  </div>\n                </div>\n              </div>\n            </div>\n\n            <div class=\"editorParamsToolbar hidden doorHangerRight\" id=\"editorFreeTextParamsToolbar\"\n              [class.server-side-rendering]=\"serverSideRendering\">\n              <div class=\"editorParamsToolbarContainer\">\n                <div class=\"editorParamsSetter\">\n                  <label for=\"editorFreeTextColor\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-free-text-color-input\">Font Color</label>\n                  <input type=\"color\" id=\"editorFreeTextColor\" class=\"editorParamsColor\" />\n                </div>\n                <div class=\"editorParamsSetter\">\n                  <label for=\"editorFreeTextFontSize\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-free-text-size-input\">Font Size</label>\n                  <input type=\"range\" id=\"editorFreeTextFontSize\" class=\"editorParamsSlider\" value=\"10\" min=\"5\"\n                    max=\"100\" step=\"1\" />\n                </div>\n              </div>\n            </div>\n\n            <div class=\"editorParamsToolbar hidden doorHangerRight\" id=\"editorStampParamsToolbar\">\n              <div class=\"editorParamsToolbarContainer\">\n                <button id=\"editorStampAddImage\" class=\"secondaryToolbarButton\" title=\"Add image\"\n                  data-l10n-id=\"pdfjs-editor-stamp-add-image-button\" aria-label=\"Add image\">\n                  <svg role=\"img\" aria-label=\"Add image\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\"\n                    xmlns=\"http://www.w3.org/2000/svg\" class=\"align-image-to-text\">\n                    <path\n                      d=\"M7.00488 9.75V14C7.00488 14.1658 7.07073 14.3247 7.18794 14.4419C7.30515 14.5592 7.46412 14.625 7.62988 14.625C7.79564 14.625 7.95461 14.5592 8.07183 14.4419C8.18904 14.3247 8.25488 14.1658 8.25488 14V9.75L8.75488 9.25H13.0049C13.1706 9.25 13.3296 9.18415 13.4468 9.06694C13.564 8.94973 13.6299 8.79076 13.6299 8.625C13.6299 8.45924 13.564 8.30027 13.4468 8.18306C13.3296 8.06585 13.1706 8 13.0049 8H8.75488L8.25488 7.5V3.25C8.25488 3.08424 8.18904 2.92527 8.07183 2.80806C7.95461 2.69085 7.79564 2.625 7.62988 2.625C7.46412 2.625 7.30515 2.69085 7.18794 2.80806C7.07073 2.92527 7.00488 3.08424 7.00488 3.25V7.5L6.50488 8H2.25488C2.08912 8 1.93015 8.06585 1.81294 8.18306C1.69573 8.30027 1.62988 8.45924 1.62988 8.625C1.62988 8.79076 1.69573 8.94973 1.81294 9.06694C1.93015 9.18415 2.08912 9.25 2.25488 9.25H6.39188L7.00488 9.75Z\"\n                      fill=\"black\" />\n                  </svg>\n                  <span data-l10n-id=\"pdfjs-editor-stamp-add-image-button-label\">Add image</span>\n                </button>\n              </div>\n            </div>\n\n            <div class=\"editorParamsToolbar hidden doorHangerRight\" id=\"editorInkParamsToolbar\"\n              [class.server-side-rendering]=\"serverSideRendering\">\n              <div class=\"editorParamsToolbarContainer\">\n                <div class=\"editorParamsSetter\">\n                  <label for=\"editorInkColor\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-ink-color-input\">Color</label>\n                  <input type=\"color\" id=\"editorInkColor\" class=\"editorParamsColor\" />\n                </div>\n                <div class=\"editorParamsSetter\">\n                  <label for=\"editorInkThickness\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-ink-thickness-input\">Thickness</label>\n                  <input type=\"range\" id=\"editorInkThickness\" class=\"editorParamsSlider\" value=\"1\" min=\"1\" max=\"20\"\n                    step=\"1\" />\n                </div>\n                <div class=\"editorParamsSetter\">\n                  <label for=\"editorInkOpacity\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-ink-opacity-input\">Opacity</label>\n                  @if(pdfJsVersion.startsWith('4.7')) {\n                  <input type=\"range\" id=\"editorInkOpacity\" class=\"editorParamsSlider\" value=\"100\" min=\"1\" max=\"100\"\n                    step=\"1\" />\n                  }\n                  @else {\n                  <input type=\"range\" id=\"editorInkOpacity\" class=\"editorParamsSlider\" value=\"1\" min=\"0.05\" max=\"1\"\n                    step=\"0.05\" />\n                  }\n                </div>\n              </div>\n            </div>\n\n            <pdf-secondary-toolbar #pdfSecondaryToolbarComponent [class.server-side-rendering]=\"serverSideRendering\"\n              [customSecondaryToolbar]=\"customSecondaryToolbar\" [secondaryToolbarTop]=\"secondaryToolbarTop\"\n              [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\" (spreadChange)=\"onSpreadChange($event)\"\n              [localizationInitialized]=\"localizationInitialized\">\n            </pdf-secondary-toolbar>\n\n            <pdf-findbar [class.server-side-rendering]=\"serverSideRendering\" [findbarLeft]=\"findbarLeft\"\n              [findbarTop]=\"findbarTop\" [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\"\n              [showFindButton]=\"showFindButton || false\" [customFindbarInputArea]=\"customFindbarInputArea\"\n              [customFindbarButtons]=\"customFindbarButtons\" [showFindEntireWord]=\"showFindEntireWord\"\n              [showFindHighlightAll]=\"showFindHighlightAll\" [showFindMatchDiacritics]=\"showFindMatchDiacritics\"\n              [showFindMatchCase]=\"showFindMatchCase\" [showFindMultiple]=\"showFindMultiple\"\n              [showFindRegexp]=\"showFindRegexp\" [showFindMessages]=\"showFindMessages\"\n              [showFindResultsCount]=\"showFindResultsCount\">\n            </pdf-findbar>\n\n            <pdf-context-menu></pdf-context-menu>\n\n            <div id=\"viewerContainer\" [style.top]=\"viewerPositionTop\" [style.backgroundColor]=\"backgroundColor\">\n              @if (hasSignature && showUnverifiedSignatures) {\n              <div class=\"unverified-signature-warning\">\n                {{\n                'unverified-signature-warning'\n                | translate\n                : \"This PDF file contains a digital signature. The PDF viewer can't verify if the signature is valid.\n                Please download the file and open it in Acrobat Reader to verify the signature is valid.\"\n                | async\n                }}\n              </div>\n              }\n              <div id=\"viewer\" class=\"pdfViewer\" (dblclick)=\"zoomToPageWidth($event)\"></div>\n            </div>\n            <pdf-error-message></pdf-error-message>\n          </div>\n          <!-- mainContainer -->\n\n          <div id=\"dialogContainer\">\n            <pdf-password-dialog></pdf-password-dialog>\n            <pdf-document-properties-dialog></pdf-document-properties-dialog>\n            <pdf-alt-text-dialog></pdf-alt-text-dialog>\n            <pdf-alt-text-settings-dialog></pdf-alt-text-settings-dialog>\n            <pdf-prepare-printing-dialog></pdf-prepare-printing-dialog>\n          </div>\n          <!-- dialogContainer -->\n        </div>\n        @if(!pdfJsVersion.startsWith('4.7')) {\n        <div id=\"editorUndoBar\" class=\"messageBar\" role=\"status\" aria-labelledby=\"editorUndoBarMessage\" tabindex=\"-1\"\n          hidden>\n          <div>\n            <div>\n              <span id=\"editorUndoBarMessage\" class=\"description\"></span>\n            </div>\n            <button id=\"editorUndoBarUndoButton\" class=\"undoButton\" type=\"button\" tabindex=\"0\" title=\"Undo\"\n              data-l10n-id=\"pdfjs-editor-undo-bar-undo-button\">\n              <span data-l10n-id=\"pdfjs-editor-undo-bar-undo-button-label\">Undo</span>\n            </button>\n            <button id=\"editorUndoBarCloseButton\" class=\"closeButton\" type=\"button\" tabindex=\"0\" title=\"Close\"\n              data-l10n-id=\"pdfjs-editor-undo-bar-close-button\">\n              <span data-l10n-id=\"pdfjs-editor-undo-bar-close-button-label\">Close</span>\n            </button>\n          </div>\n        </div> <!-- editorUndoBar -->\n        }\n        <!-- outerContainer -->\n      </div>\n    </div>\n  </div>\n</ng-template>\n\n<ng-template #defaultFreeFloatingBar> </ng-template>", styles: ["#mainContainer.toolbar-hidden{margin-top:-30px}.server-side-rendering,.hidden{display:none}\n"], dependencies: [{ kind: "directive", type: i2.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: i7.DynamicCssComponent, selector: "pdf-dynamic-css", inputs: ["zoom", "width"] }, { kind: "component", type: i8.PdfAcroformDefaultThemeComponent, selector: "pdf-acroform-default-theme" }, { kind: "component", type: i9.PdfContextMenuComponent, selector: "pdf-context-menu" }, { kind: "component", type: i10.PdfDarkThemeComponent, selector: "pdf-dark-theme" }, { kind: "component", type: i11.PdfAltTextDialogComponent, selector: "pdf-alt-text-dialog" }, { kind: "component", type: i12.PdfAltTextSettingsDialogComponent, selector: "pdf-alt-text-settings-dialog" }, { kind: "component", type: i13.PdfDocumentPropertiesDialogComponent, selector: "pdf-document-properties-dialog" }, { kind: "component", type: i14.PdfDummyComponentsComponent, selector: "pdf-dummy-components" }, { kind: "component", type: i15.PdfErrorMessageComponent, selector: "pdf-error-message" }, { kind: "component", type: i16.PdfFindbarComponent, selector: "pdf-findbar", inputs: ["showFindButton", "mobileFriendlyZoomScale", "findbarLeft", "findbarTop", "customFindbarInputArea", "customFindbar", "customFindbarButtons", "showFindHighlightAll", "showFindMatchCase", "showFindEntireWord", "showFindMatchDiacritics", "showFindResultsCount", "showFindMessages", "showFindMultiple", "showFindRegexp"] }, { kind: "component", type: i17.PdfLightThemeComponent, selector: "pdf-light-theme" }, { kind: "component", type: i18.PdfPasswordDialogComponent, selector: "pdf-password-dialog" }, { kind: "component", type: i19.PdfPreparePrintingDialogComponent, selector: "pdf-prepare-printing-dialog" }, { kind: "component", type: i20.PdfSecondaryToolbarComponent, selector: "pdf-secondary-toolbar", inputs: ["customSecondaryToolbar", "secondaryToolbarTop", "mobileFriendlyZoomScale", "localizationInitialized"], outputs: ["spreadChange"] }, { kind: "component", type: i21.PdfSidebarComponent, selector: "pdf-sidebar", inputs: ["sidebarPositionTop", "sidebarVisible", "mobileFriendlyZoomScale", "showSidebarButton", "customSidebar", "customThumbnail"], outputs: ["thumbnailDrawn"] }, { kind: "component", type: i22.PdfToolbarComponent, selector: "pdf-toolbar", inputs: ["customToolbar", "hasTextLayer", "mobileFriendlyZoomScale", "primaryMenuVisible", "showDownloadButton", "showDrawEditor", "showHighlightEditor", "showTextEditor", "showStampEditor", "showFindButton", "showHandToolButton", "showZoomDropdown", "handTool", "showOpenFileButton", "showPrintButton", "showPagingButtons", "showFirstAndLastPageButtons", "showPreviousAndNextPageButtons", "showPageNumber", "showPageLabel", "showPresentationModeButton", "showRotateCwButton", "showRotateCcwButton", "showSecondaryToolbarButton", "showSidebarButton", "sidebarVisible", "showZoomButtons", "textLayer", "toolbarMarginTop", "toolbarWidth", "zoomLevels", "pageViewMode", "spread", "scrollMode", "showPropertiesButton", "showSpreadButton", "showSinglePageModeButton", "showVerticalScrollButton", "showHorizontalScrollButton", "showWrappedScrollButton", "showInfiniteScrollButton", "showBookModeButton", "findbarVisible"], outputs: ["pageViewModeChange", "onToolbarLoaded"] }, { kind: "pipe", type: i2.AsyncPipe, name: "async" }, { kind: "pipe", type: i23.TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxExtendedPdfViewerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-extended-pdf-viewer', changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (theme === 'dark') {\n<pdf-dark-theme></pdf-dark-theme>\n}\n@if (theme === 'light') {\n<pdf-light-theme></pdf-light-theme>\n}\n<pdf-acroform-default-theme></pdf-acroform-default-theme>\n\n<pdf-dynamic-css #DynamicCssComponent [zoom]=\"mobileFriendlyZoomScale\"></pdf-dynamic-css>\n<ng-content *ngTemplateOutlet=\"customPdfViewer ? customPdfViewer : defaultPdfViewer\"></ng-content>\n\n<ng-template #defaultPdfViewer>\n  <div class=\"zoom\" [style.height]=\"minHeight ? minHeight : height\" #root>\n    <div class=\"html\">\n      <div class=\"body pdf-js-version-{{ majorMinorPdfJsVersion }}\" [style.backgroundColor]=\"backgroundColor\">\n        <div id=\"outerContainer\">\n          @if (showFreeFloatingBar) {\n          <div class=\"free-floating-bar\">\n            <ng-content *ngTemplateOutlet=\"customFreeFloatingBar ? customFreeFloatingBar : defaultFreeFloatingBar\">\n            </ng-content>\n          </div>\n          }\n          <pdf-sidebar #pdfsidebar [sidebarVisible]=\"sidebarVisible || false\" [showSidebarButton]=\"showSidebarButton\"\n            [customSidebar]=\"customSidebar\" [customThumbnail]=\"customThumbnail\"\n            (thumbnailDrawn)=\"thumbnailDrawn.emit($event)\" [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\"\n            [sidebarPositionTop]=\"sidebarPositionTop\">\n          </pdf-sidebar>\n          <div id=\"mainContainer\" [class.toolbar-hidden]=\"!primaryMenuVisible\">\n            <pdf-dummy-components></pdf-dummy-components>\n\n            <pdf-toolbar (onToolbarLoaded)=\"onToolbarLoaded($event)\" [sidebarVisible]=\"sidebarVisible\"\n              [class.server-side-rendering]=\"serverSideRendering\" [customToolbar]=\"customToolbar\"\n              [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\" [(pageViewMode)]=\"pageViewMode\"\n              [primaryMenuVisible]=\"primaryMenuVisible\" [scrollMode]=\"scrollMode ?? 0\"\n              [showPropertiesButton]=\"showPropertiesButton\" [showBookModeButton]=\"showBookModeButton\"\n              [showDownloadButton]=\"showDownloadButton\" [showDrawEditor]=\"showDrawEditor\"\n              [showHighlightEditor]=\"showHighlightEditor\" [showFindButton]=\"showFindButton\"\n              [showHandToolButton]=\"showHandToolButton\" [handTool]=\"handTool\"\n              [showHorizontalScrollButton]=\"showHorizontalScrollButton\"\n              [showInfiniteScrollButton]=\"showInfiniteScrollButton\" [showOpenFileButton]=\"showOpenFileButton\"\n              [showPagingButtons]=\"showPagingButtons\" [showFirstAndLastPageButtons]=\"showFirstAndLastPageButtons\"\n              [showPreviousAndNextPageButtons]=\"showPreviousAndNextPageButtons\" [showPageNumber]=\"showPageNumber\"\n              [showPageLabel]=\"showPageLabel\"\n              [showPresentationModeButton]=\"showPresentationModeButton && pageViewMode !== 'book'\"\n              [showPrintButton]=\"enablePrint ? showPrintButton : false\" [showRotateCwButton]=\"showRotateCwButton\"\n              [showRotateCcwButton]=\"showRotateCcwButton\"\n              [showSecondaryToolbarButton]=\"showSecondaryToolbarButton && !service.secondaryMenuIsEmpty\"\n              [showSidebarButton]=\"showSidebarButton\" [showSinglePageModeButton]=\"showSinglePageModeButton\"\n              [showSpreadButton]=\"showSpreadButton\" [showStampEditor]=\"showStampEditor\"\n              [showTextEditor]=\"showTextEditor\" [showVerticalScrollButton]=\"showVerticalScrollButton\"\n              [showWrappedScrollButton]=\"showWrappedScrollButton\"\n              [showZoomButtons]=\"showZoomButtons && pageViewMode !== 'book'\" [showZoomDropdown]=\"showZoomDropdown\"\n              [spread]=\"spread\" [textLayer]=\"textLayer\" [toolbarMarginTop]=\"toolbarMarginTop\"\n              [toolbarWidth]=\"toolbarWidth\" [zoomLevels]=\"zoomLevels\" [findbarVisible]=\"findbarVisible\"\n              [hasTextLayer]=\"hasTextLayer\"></pdf-toolbar>\n\n            <div class=\"editorParamsToolbar hidden doorHangerRight\" id=\"editorHighlightParamsToolbar\">\n              <div id=\"highlightParamsToolbarContainer\" class=\"editorParamsToolbarContainer\">\n                <div id=\"editorHighlightColorPicker\" class=\"colorPicker\">\n                  <span id=\"highlightColorPickerLabel\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-highlight-colorpicker-label\">Highlight color</span>\n                </div>\n                <div id=\"editorHighlightThickness\">\n                  <label for=\"editorFreeHighlightThickness\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-free-highlight-thickness-input\">Thickness</label>\n                  <div class=\"thicknessPicker\">\n                    <input type=\"range\" id=\"editorFreeHighlightThickness\" class=\"editorParamsSlider\"\n                      data-l10n-id=\"pdfjs-editor-free-highlight-thickness-title\" value=\"12\" min=\"8\" max=\"24\" step=\"1\" />\n                  </div>\n                </div>\n                <div id=\"editorHighlightVisibility\">\n                  <div class=\"divider\"></div>\n                  <div class=\"toggler\">\n                    <label for=\"editorHighlightShowAll\" class=\"editorParamsLabel\"\n                      data-l10n-id=\"pdfjs-editor-highlight-show-all-button-label\">Show all</label>\n                    <button id=\"editorHighlightShowAll\" class=\"toggle-button\"\n                      data-l10n-id=\"pdfjs-editor-highlight-show-all-button\" aria-pressed=\"true\"></button>\n                  </div>\n                </div>\n              </div>\n            </div>\n\n            <div class=\"editorParamsToolbar hidden doorHangerRight\" id=\"editorFreeTextParamsToolbar\"\n              [class.server-side-rendering]=\"serverSideRendering\">\n              <div class=\"editorParamsToolbarContainer\">\n                <div class=\"editorParamsSetter\">\n                  <label for=\"editorFreeTextColor\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-free-text-color-input\">Font Color</label>\n                  <input type=\"color\" id=\"editorFreeTextColor\" class=\"editorParamsColor\" />\n                </div>\n                <div class=\"editorParamsSetter\">\n                  <label for=\"editorFreeTextFontSize\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-free-text-size-input\">Font Size</label>\n                  <input type=\"range\" id=\"editorFreeTextFontSize\" class=\"editorParamsSlider\" value=\"10\" min=\"5\"\n                    max=\"100\" step=\"1\" />\n                </div>\n              </div>\n            </div>\n\n            <div class=\"editorParamsToolbar hidden doorHangerRight\" id=\"editorStampParamsToolbar\">\n              <div class=\"editorParamsToolbarContainer\">\n                <button id=\"editorStampAddImage\" class=\"secondaryToolbarButton\" title=\"Add image\"\n                  data-l10n-id=\"pdfjs-editor-stamp-add-image-button\" aria-label=\"Add image\">\n                  <svg role=\"img\" aria-label=\"Add image\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\"\n                    xmlns=\"http://www.w3.org/2000/svg\" class=\"align-image-to-text\">\n                    <path\n                      d=\"M7.00488 9.75V14C7.00488 14.1658 7.07073 14.3247 7.18794 14.4419C7.30515 14.5592 7.46412 14.625 7.62988 14.625C7.79564 14.625 7.95461 14.5592 8.07183 14.4419C8.18904 14.3247 8.25488 14.1658 8.25488 14V9.75L8.75488 9.25H13.0049C13.1706 9.25 13.3296 9.18415 13.4468 9.06694C13.564 8.94973 13.6299 8.79076 13.6299 8.625C13.6299 8.45924 13.564 8.30027 13.4468 8.18306C13.3296 8.06585 13.1706 8 13.0049 8H8.75488L8.25488 7.5V3.25C8.25488 3.08424 8.18904 2.92527 8.07183 2.80806C7.95461 2.69085 7.79564 2.625 7.62988 2.625C7.46412 2.625 7.30515 2.69085 7.18794 2.80806C7.07073 2.92527 7.00488 3.08424 7.00488 3.25V7.5L6.50488 8H2.25488C2.08912 8 1.93015 8.06585 1.81294 8.18306C1.69573 8.30027 1.62988 8.45924 1.62988 8.625C1.62988 8.79076 1.69573 8.94973 1.81294 9.06694C1.93015 9.18415 2.08912 9.25 2.25488 9.25H6.39188L7.00488 9.75Z\"\n                      fill=\"black\" />\n                  </svg>\n                  <span data-l10n-id=\"pdfjs-editor-stamp-add-image-button-label\">Add image</span>\n                </button>\n              </div>\n            </div>\n\n            <div class=\"editorParamsToolbar hidden doorHangerRight\" id=\"editorInkParamsToolbar\"\n              [class.server-side-rendering]=\"serverSideRendering\">\n              <div class=\"editorParamsToolbarContainer\">\n                <div class=\"editorParamsSetter\">\n                  <label for=\"editorInkColor\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-ink-color-input\">Color</label>\n                  <input type=\"color\" id=\"editorInkColor\" class=\"editorParamsColor\" />\n                </div>\n                <div class=\"editorParamsSetter\">\n                  <label for=\"editorInkThickness\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-ink-thickness-input\">Thickness</label>\n                  <input type=\"range\" id=\"editorInkThickness\" class=\"editorParamsSlider\" value=\"1\" min=\"1\" max=\"20\"\n                    step=\"1\" />\n                </div>\n                <div class=\"editorParamsSetter\">\n                  <label for=\"editorInkOpacity\" class=\"editorParamsLabel\"\n                    data-l10n-id=\"pdfjs-editor-ink-opacity-input\">Opacity</label>\n                  @if(pdfJsVersion.startsWith('4.7')) {\n                  <input type=\"range\" id=\"editorInkOpacity\" class=\"editorParamsSlider\" value=\"100\" min=\"1\" max=\"100\"\n                    step=\"1\" />\n                  }\n                  @else {\n                  <input type=\"range\" id=\"editorInkOpacity\" class=\"editorParamsSlider\" value=\"1\" min=\"0.05\" max=\"1\"\n                    step=\"0.05\" />\n                  }\n                </div>\n              </div>\n            </div>\n\n            <pdf-secondary-toolbar #pdfSecondaryToolbarComponent [class.server-side-rendering]=\"serverSideRendering\"\n              [customSecondaryToolbar]=\"customSecondaryToolbar\" [secondaryToolbarTop]=\"secondaryToolbarTop\"\n              [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\" (spreadChange)=\"onSpreadChange($event)\"\n              [localizationInitialized]=\"localizationInitialized\">\n            </pdf-secondary-toolbar>\n\n            <pdf-findbar [class.server-side-rendering]=\"serverSideRendering\" [findbarLeft]=\"findbarLeft\"\n              [findbarTop]=\"findbarTop\" [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\"\n              [showFindButton]=\"showFindButton || false\" [customFindbarInputArea]=\"customFindbarInputArea\"\n              [customFindbarButtons]=\"customFindbarButtons\" [showFindEntireWord]=\"showFindEntireWord\"\n              [showFindHighlightAll]=\"showFindHighlightAll\" [showFindMatchDiacritics]=\"showFindMatchDiacritics\"\n              [showFindMatchCase]=\"showFindMatchCase\" [showFindMultiple]=\"showFindMultiple\"\n              [showFindRegexp]=\"showFindRegexp\" [showFindMessages]=\"showFindMessages\"\n              [showFindResultsCount]=\"showFindResultsCount\">\n            </pdf-findbar>\n\n            <pdf-context-menu></pdf-context-menu>\n\n            <div id=\"viewerContainer\" [style.top]=\"viewerPositionTop\" [style.backgroundColor]=\"backgroundColor\">\n              @if (hasSignature && showUnverifiedSignatures) {\n              <div class=\"unverified-signature-warning\">\n                {{\n                'unverified-signature-warning'\n                | translate\n                : \"This PDF file contains a digital signature. The PDF viewer can't verify if the signature is valid.\n                Please download the file and open it in Acrobat Reader to verify the signature is valid.\"\n                | async\n                }}\n              </div>\n              }\n              <div id=\"viewer\" class=\"pdfViewer\" (dblclick)=\"zoomToPageWidth($event)\"></div>\n            </div>\n            <pdf-error-message></pdf-error-message>\n          </div>\n          <!-- mainContainer -->\n\n          <div id=\"dialogContainer\">\n            <pdf-password-dialog></pdf-password-dialog>\n            <pdf-document-properties-dialog></pdf-document-properties-dialog>\n            <pdf-alt-text-dialog></pdf-alt-text-dialog>\n            <pdf-alt-text-settings-dialog></pdf-alt-text-settings-dialog>\n            <pdf-prepare-printing-dialog></pdf-prepare-printing-dialog>\n          </div>\n          <!-- dialogContainer -->\n        </div>\n        @if(!pdfJsVersion.startsWith('4.7')) {\n        <div id=\"editorUndoBar\" class=\"messageBar\" role=\"status\" aria-labelledby=\"editorUndoBarMessage\" tabindex=\"-1\"\n          hidden>\n          <div>\n            <div>\n              <span id=\"editorUndoBarMessage\" class=\"description\"></span>\n            </div>\n            <button id=\"editorUndoBarUndoButton\" class=\"undoButton\" type=\"button\" tabindex=\"0\" title=\"Undo\"\n              data-l10n-id=\"pdfjs-editor-undo-bar-undo-button\">\n              <span data-l10n-id=\"pdfjs-editor-undo-bar-undo-button-label\">Undo</span>\n            </button>\n            <button id=\"editorUndoBarCloseButton\" class=\"closeButton\" type=\"button\" tabindex=\"0\" title=\"Close\"\n              data-l10n-id=\"pdfjs-editor-undo-bar-close-button\">\n              <span data-l10n-id=\"pdfjs-editor-undo-bar-close-button-label\">Close</span>\n            </button>\n          </div>\n        </div> <!-- editorUndoBar -->\n        }\n        <!-- outerContainer -->\n      </div>\n    </div>\n  </div>\n</ng-template>\n\n<ng-template #defaultFreeFloatingBar> </ng-template>", styles: ["#mainContainer.toolbar-hidden{margin-top:-30px}.server-side-rendering,.hidden{display:none}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i1.PDFNotificationService }, { type: i0.ElementRef }, { type: i2.PlatformLocation }, { type: i0.ChangeDetectorRef }, { type: i3.NgxExtendedPdfViewerService }, { type: i0.Renderer2 }, { type: i4.PDFScriptLoaderService }, { type: i5.NgxKeyboardManagerService }, { type: i6.PdfCspPolicyService }, { type: i0.NgZone }], propDecorators: { dummyComponents: [{
                type: ViewChild,
                args: [PdfDummyComponentsComponent]
            }], root: [{
                type: ViewChild,
                args: ['root']
            }], annotationEditorEvent: [{
                type: Output
            }], customFindbarInputArea: [{
                type: Input
            }], customToolbar: [{
                type: Input
            }], customFindbar: [{
                type: Input
            }], customFindbarButtons: [{
                type: Input
            }], customPdfViewer: [{
                type: Input
            }], customSecondaryToolbar: [{
                type: Input
            }], customSidebar: [{
                type: Input
            }], customThumbnail: [{
                type: Input
            }], customFreeFloatingBar: [{
                type: Input
            }], showFreeFloatingBar: [{
                type: Input
            }], enableDragAndDrop: [{
                type: Input
            }], forceUsingLegacyES5: [{
                type: Input
            }], formData: [{
                type: Input
            }], disableForms: [{
                type: Input
            }], formDataChange: [{
                type: Output
            }], pageViewMode: [{
                type: Input
            }], pageViewModeChange: [{
                type: Output
            }], progress: [{
                type: Output
            }], secondaryToolbarComponent: [{
                type: ViewChild,
                args: ['pdfSecondaryToolbarComponent']
            }], dynamicCSSComponent: [{
                type: ViewChild,
                args: ['DynamicCssComponent']
            }], sidebarComponent: [{
                type: ViewChild,
                args: ['pdfsidebar']
            }], srcChange: [{
                type: Output
            }], scrollMode: [{
                type: Input
            }], scrollModeChange: [{
                type: Output
            }], authorization: [{
                type: Input
            }], httpHeaders: [{
                type: Input
            }], contextMenuAllowed: [{
                type: Input
            }], afterPrint: [{
                type: Output
            }], beforePrint: [{
                type: Output
            }], currentZoomFactor: [{
                type: Output
            }], enablePrint: [{
                type: Input
            }], enablePrintAutoRotate: [{
                type: Input
            }], showTextEditor: [{
                type: Input
            }], showStampEditor: [{
                type: Input
            }], showDrawEditor: [{
                type: Input
            }], showHighlightEditor: [{
                type: Input
            }], logLevel: [{
                type: Input
            }], relativeCoordsOptions: [{
                type: Input
            }], minifiedJSLibraries: [{
                type: Input
            }], printResolution: [{
                type: Input
            }], rotation: [{
                type: Input
            }], rotationChange: [{
                type: Output
            }], annotationLayerRendered: [{
                type: Output
            }], annotationEditorLayerRendered: [{
                type: Output
            }], xfaLayerRendered: [{
                type: Output
            }], outlineLoaded: [{
                type: Output
            }], attachmentsloaded: [{
                type: Output
            }], layersloaded: [{
                type: Output
            }], src: [{
                type: Input
            }], base64Src: [{
                type: Input
            }], minHeight: [{
                type: Input
            }], height: [{
                type: Input
            }], backgroundColor: [{
                type: Input
            }], filenameForDownload: [{
                type: Input
            }], ignoreKeyboard: [{
                type: Input
            }], ignoreKeys: [{
                type: Input
            }], acceptKeys: [{
                type: Input
            }], imageResourcesPath: [{
                type: Input
            }], localeFolderPath: [{
                type: Input
            }], language: [{
                type: Input
            }], listenToURL: [{
                type: Input
            }], nameddest: [{
                type: Input
            }], password: [{
                type: Input
            }], replaceBrowserPrint: [{
                type: Input
            }], useInlineScripts: [{
                type: Input
            }], showUnverifiedSignatures: [{
                type: Input
            }], startTabindex: [{
                type: Input
            }], showSidebarButton: [{
                type: Input
            }], sidebarVisible: [{
                type: Input
            }], sidebarVisibleChange: [{
                type: Output
            }], activeSidebarView: [{
                type: Input
            }], activeSidebarViewChange: [{
                type: Output
            }], findbarVisible: [{
                type: Input
            }], findbarVisibleChange: [{
                type: Output
            }], propertiesDialogVisible: [{
                type: Input
            }], propertiesDialogVisibleChange: [{
                type: Output
            }], showFindButton: [{
                type: Input
            }], showFindHighlightAll: [{
                type: Input
            }], showFindMatchCase: [{
                type: Input
            }], showFindMultiple: [{
                type: Input
            }], showFindRegexp: [{
                type: Input
            }], showFindEntireWord: [{
                type: Input
            }], showFindMatchDiacritics: [{
                type: Input
            }], showFindResultsCount: [{
                type: Input
            }], showFindMessages: [{
                type: Input
            }], showPagingButtons: [{
                type: Input
            }], showFirstAndLastPageButtons: [{
                type: Input
            }], showPreviousAndNextPageButtons: [{
                type: Input
            }], showPageNumber: [{
                type: Input
            }], showPageLabel: [{
                type: Input
            }], showZoomButtons: [{
                type: Input
            }], showZoomDropdown: [{
                type: Input
            }], showPresentationModeButton: [{
                type: Input
            }], showOpenFileButton: [{
                type: Input
            }], showPrintButton: [{
                type: Input
            }], showDownloadButton: [{
                type: Input
            }], theme: [{
                type: Input
            }], showToolbar: [{
                type: Input
            }], showSecondaryToolbarButton: [{
                type: Input
            }], showSinglePageModeButton: [{
                type: Input
            }], showVerticalScrollButton: [{
                type: Input
            }], showHorizontalScrollButton: [{
                type: Input
            }], showWrappedScrollButton: [{
                type: Input
            }], showInfiniteScrollButton: [{
                type: Input
            }], showBookModeButton: [{
                type: Input
            }], showRotateButton: [{
                type: Input
            }], showRotateCwButton: [{
                type: Input
            }], showRotateCcwButton: [{
                type: Input
            }], handTool: [{
                type: Input
            }], handToolChange: [{
                type: Output
            }], showHandToolButton: [{
                type: Input
            }], showSpreadButton: [{
                type: Input
            }], showPropertiesButton: [{
                type: Input
            }], showBorders: [{
                type: Input
            }], spread: [{
                type: Input
            }], showScrollingButtons: [{
                type: Input
            }], spreadChange: [{
                type: Output
            }], thumbnailDrawn: [{
                type: Output
            }], page: [{
                type: Input
            }], pageChange: [{
                type: Output
            }], pageLabel: [{
                type: Input
            }], pageLabelChange: [{
                type: Output
            }], pagesLoaded: [{
                type: Output
            }], pageRender: [{
                type: Output
            }], pageRendered: [{
                type: Output
            }], pdfDownloaded: [{
                type: Output
            }], pdfLoaded: [{
                type: Output
            }], pdfLoadingStarts: [{
                type: Output
            }], pdfLoadingFailed: [{
                type: Output
            }], textLayer: [{
                type: Input
            }], textLayerRendered: [{
                type: Output
            }], annotationEditorModeChanged: [{
                type: Output
            }], updateFindMatchesCount: [{
                type: Output
            }], updateFindState: [{
                type: Output
            }], zoom: [{
                type: Input
            }], zoomChange: [{
                type: Output
            }], zoomLevels: [{
                type: Input
            }], maxZoom: [{
                type: Input
            }], minZoom: [{
                type: Input
            }], mobileFriendlyZoom: [{
                type: Input
            }], onContextMenu: [{
                type: HostListener,
                args: ['contextmenu']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIvc3JjL2xpYi9uZ3gtZXh0ZW5kZWQtcGRmLXZpZXdlci5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZXh0ZW5kZWQtcGRmLXZpZXdlci9zcmMvbGliL25neC1leHRlbmRlZC1wZGYtdmlld2VyLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBb0IsTUFBTSxpQkFBaUIsQ0FBQztBQUN0RSxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFFVCxZQUFZLEVBQ1osWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBS0wsTUFBTSxFQUNOLFdBQVcsRUFJWCxTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFtQnZCLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDL0YsT0FBTyxFQUE0QyxjQUFjLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUdoRyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDM0QsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFlcEcsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBR3BELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRCN0QsTUFBTSxPQUFPLDZCQUE2QjtJQWk3QkE7SUFDckI7SUFDQTtJQUNBO0lBQ1Y7SUFDQTtJQUNVO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7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RDVCLEtBQUs7Z0JBcThDQyxhQUFhO3NCQURuQixZQUFZO3VCQUFDLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1BsYXRmb3JtQnJvd3NlciwgUGxhdGZvcm1Mb2NhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBIb3N0TGlzdGVuZXIsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBQTEFURk9STV9JRCxcbiAgUmVuZGVyZXIyLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NoaWxkLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBkZkRvY3VtZW50TG9hZGVkRXZlbnQgfSBmcm9tICcuL2V2ZW50cy9kb2N1bWVudC1sb2FkZWQtZXZlbnQnO1xuaW1wb3J0IHsgRmlsZUlucHV0Q2hhbmdlZCB9IGZyb20gJy4vZXZlbnRzL2ZpbGUtaW5wdXQtY2hhbmdlZCc7XG5pbXBvcnQgeyBGaW5kUmVzdWx0LCBGaW5kUmVzdWx0TWF0Y2hlc0NvdW50LCBGaW5kU3RhdGUgfSBmcm9tICcuL2V2ZW50cy9maW5kLXJlc3VsdCc7XG5pbXBvcnQgeyBIYW5kdG9vbENoYW5nZWQgfSBmcm9tICcuL2V2ZW50cy9oYW5kdG9vbC1jaGFuZ2VkJztcbmltcG9ydCB7IFBhZ2VOdW1iZXJDaGFuZ2UgfSBmcm9tICcuL2V2ZW50cy9wYWdlLW51bWJlci1jaGFuZ2UnO1xuaW1wb3J0IHsgUGFnZVJlbmRlckV2ZW50IH0gZnJvbSAnLi9ldmVudHMvcGFnZS1yZW5kZXItZXZlbnQnO1xuaW1wb3J0IHsgUGFnZVJlbmRlcmVkRXZlbnQgfSBmcm9tICcuL2V2ZW50cy9wYWdlLXJlbmRlcmVkLWV2ZW50JztcbmltcG9ydCB7IFBhZ2VzTG9hZGVkRXZlbnQgfSBmcm9tICcuL2V2ZW50cy9wYWdlcy1sb2FkZWQtZXZlbnQnO1xuaW1wb3J0IHsgUGFnZXNSb3RhdGlvbkV2ZW50IH0gZnJvbSAnLi9ldmVudHMvcGFnZXMtcm90YXRpb24tZXZlbnQnO1xuaW1wb3J0IHsgUGRmRG93bmxvYWRlZEV2ZW50IH0gZnJvbSAnLi9ldmVudHMvcGRmLWRvd25sb2FkZWQtZXZlbnQnO1xuaW1wb3J0IHsgUGRmTG9hZGVkRXZlbnQgfSBmcm9tICcuL2V2ZW50cy9wZGYtbG9hZGVkLWV2ZW50JztcbmltcG9ydCB7IFBkZkxvYWRpbmdTdGFydHNFdmVudCB9IGZyb20gJy4vZXZlbnRzL3BkZi1sb2FkaW5nLXN0YXJ0cy1ldmVudCc7XG5pbXBvcnQgeyBQZGZUaHVtYm5haWxEcmF3bkV2ZW50IH0gZnJvbSAnLi9ldmVudHMvcGRmLXRodW1ibmFpbC1kcmF3bi1ldmVudCc7XG5pbXBvcnQgeyBQcm9ncmVzc0JhckV2ZW50IH0gZnJvbSAnLi9ldmVudHMvcHJvZ3Jlc3MtYmFyLWV2ZW50JztcbmltcG9ydCB7IFNjYWxlQ2hhbmdpbmdFdmVudCB9IGZyb20gJy4vZXZlbnRzL3NjYWxlLWNoYW5naW5nLWV2ZW50JztcbmltcG9ydCB7IFNpZGViYXJ2aWV3Q2hhbmdlIH0gZnJvbSAnLi9ldmVudHMvc2lkZWJhcnZpZXctY2hhbmdlZCc7XG5pbXBvcnQgeyBUZXh0TGF5ZXJSZW5kZXJlZEV2ZW50IH0gZnJvbSAnLi9ldmVudHMvdGV4dGxheWVyLXJlbmRlcmVkJztcbmltcG9ydCB7IE5neEV4dGVuZGVkUGRmVmlld2VyU2VydmljZSB9IGZyb20gJy4vbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIuc2VydmljZSc7XG5pbXBvcnQgeyBQZGZDdXJzb3JUb29scyB9IGZyb20gJy4vb3B0aW9ucy9wZGYtY3Vyc29yLXRvb2xzJztcbmltcG9ydCB7IGFzc2V0c1VybCwgZ2V0VmVyc2lvblN1ZmZpeCwgcGRmRGVmYXVsdE9wdGlvbnMgfSBmcm9tICcuL29wdGlvbnMvcGRmLWRlZmF1bHQtb3B0aW9ucyc7XG5pbXBvcnQgeyBQYWdlVmlld01vZGVUeXBlLCBTY3JvbGxNb2RlQ2hhbmdlZEV2ZW50LCBTY3JvbGxNb2RlVHlwZSB9IGZyb20gJy4vb3B0aW9ucy9wZGYtdmlld2VyJztcbmltcG9ydCB7IElQREZWaWV3ZXJBcHBsaWNhdGlvbiwgUERGRG9jdW1lbnRQcm94eSwgUERGUGFnZVByb3h5IH0gZnJvbSAnLi9vcHRpb25zL3BkZi12aWV3ZXItYXBwbGljYXRpb24nO1xuaW1wb3J0IHsgSVBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucyB9IGZyb20gJy4vb3B0aW9ucy9wZGYtdmlld2VyLWFwcGxpY2F0aW9uLW9wdGlvbnMnO1xuaW1wb3J0IHsgVmVyYm9zaXR5TGV2ZWwgfSBmcm9tICcuL29wdGlvbnMvdmVyYm9zaXR5LWxldmVsJztcbmltcG9ydCB7IFBkZkR1bW15Q29tcG9uZW50c0NvbXBvbmVudCB9IGZyb20gJy4vcGRmLWR1bW15LWNvbXBvbmVudHMvcGRmLWR1bW15LWNvbXBvbmVudHMuY29tcG9uZW50JztcbmltcG9ydCB7IFBERk5vdGlmaWNhdGlvblNlcnZpY2UgfSBmcm9tICcuL3BkZi1ub3RpZmljYXRpb24tc2VydmljZSc7XG5pbXBvcnQgeyBQZGZTZWNvbmRhcnlUb29sYmFyQ29tcG9uZW50IH0gZnJvbSAnLi9zZWNvbmRhcnktdG9vbGJhci9wZGYtc2Vjb25kYXJ5LXRvb2xiYXIvcGRmLXNlY29uZGFyeS10b29sYmFyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQZGZTaWRlYmFyQ29tcG9uZW50IH0gZnJvbSAnLi9zaWRlYmFyL3BkZi1zaWRlYmFyL3BkZi1zaWRlYmFyLmNvbXBvbmVudCc7XG5cbmltcG9ydCB7IER5bmFtaWNDc3NDb21wb25lbnQgfSBmcm9tICcuL2R5bmFtaWMtY3NzL2R5bmFtaWMtY3NzLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBBbm5vdGF0aW9uRWRpdG9yRXZlbnQgfSBmcm9tICcuL2V2ZW50cy9hbm5vdGF0aW9uLWVkaXRvci1sYXllci1ldmVudCc7XG5pbXBvcnQgeyBBbm5vdGF0aW9uRWRpdG9yTGF5ZXJSZW5kZXJlZEV2ZW50IH0gZnJvbSAnLi9ldmVudHMvYW5ub3RhdGlvbi1lZGl0b3ItbGF5ZXItcmVuZGVyZWQtZXZlbnQnO1xuaW1wb3J0IHsgQW5ub3RhdGlvbkVkaXRvckVkaXRvck1vZGVDaGFuZ2VkRXZlbnQgfSBmcm9tICcuL2V2ZW50cy9hbm5vdGF0aW9uLWVkaXRvci1tb2RlLWNoYW5nZWQtZXZlbnQnO1xuaW1wb3J0IHsgQW5ub3RhdGlvbkxheWVyUmVuZGVyZWRFdmVudCB9IGZyb20gJy4vZXZlbnRzL2Fubm90YXRpb24tbGF5ZXItcmVuZGVyZWQtZXZlbnQnO1xuaW1wb3J0IHsgQXR0YWNobWVudExvYWRlZEV2ZW50IH0gZnJvbSAnLi9ldmVudHMvYXR0YWNobWVudC1sb2FkZWQtZXZlbnQnO1xuaW1wb3J0IHsgTGF5ZXJzTG9hZGVkRXZlbnQgfSBmcm9tICcuL2V2ZW50cy9sYXllcnMtbG9hZGVkLWV2ZW50JztcbmltcG9ydCB7IE91dGxpbmVMb2FkZWRFdmVudCB9IGZyb20gJy4vZXZlbnRzL291dGxpbmUtbG9hZGVkLWV2ZW50JztcbmltcG9ydCB7IFRvZ2dsZVNpZGViYXJFdmVudCB9IGZyb20gJy4vZXZlbnRzL3RvZ2dsZS1zaWRlYmFyLWV2ZW50JztcbmltcG9ydCB7IFhmYUxheWVyUmVuZGVyZWRFdmVudCB9IGZyb20gJy4vZXZlbnRzL3hmYS1sYXllci1yZW5kZXJlZC1ldmVudCc7XG5pbXBvcnQgeyBOZ3hGb3JtU3VwcG9ydCB9IGZyb20gJy4vbmd4LWZvcm0tc3VwcG9ydCc7XG5pbXBvcnQgeyBOZ3hIYXNIZWlnaHQgfSBmcm9tICcuL25neC1oYXMtaGVpZ2h0JztcbmltcG9ydCB7IE5neEtleWJvYXJkTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuL25neC1rZXlib2FyZC1tYW5hZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgUGRmU2lkZWJhclZpZXcgfSBmcm9tICcuL29wdGlvbnMvcGRmLXNpZGViYXItdmlld3MnO1xuaW1wb3J0IHsgU3ByZWFkVHlwZSB9IGZyb20gJy4vb3B0aW9ucy9zcHJlYWQtdHlwZSc7XG5pbXBvcnQgeyBQZGZDc3BQb2xpY3lTZXJ2aWNlIH0gZnJvbSAnLi9wZGYtY3NwLXBvbGljeS5zZXJ2aWNlJztcbmltcG9ydCB7IFBERlNjcmlwdExvYWRlclNlcnZpY2UgfSBmcm9tICcuL3BkZi1zY3JpcHQtbG9hZGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzcG9uc2l2ZVZpc2liaWxpdHkgfSBmcm9tICcuL3Jlc3BvbnNpdmUtdmlzaWJpbGl0eSc7XG5cbmRlY2xhcmUgY2xhc3MgUmVzaXplT2JzZXJ2ZXIge1xuICBjb25zdHJ1Y3RvcihwYXJhbTogKCkgPT4gdm9pZCk7XG4gIHB1YmxpYyBkaXNjb25uZWN0KCk7XG4gIHB1YmxpYyBvYnNlcnZlKGRpdjogSFRNTEVsZW1lbnQpO1xufVxuXG5pbnRlcmZhY2UgRWxlbWVudEFuZFBvc2l0aW9uIHtcbiAgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZvcm1EYXRhVHlwZSB7XG4gIFtmaWVsZE5hbWU6IHN0cmluZ106IG51bGwgfCBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgc3RyaW5nW107XG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25neC1leHRlbmRlZC1wZGYtdmlld2VyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL25neC1leHRlbmRlZC1wZGYtdmlld2VyLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIuY29tcG9uZW50LmNzcyddLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbn0pXG5leHBvcnQgY2xhc3MgTmd4RXh0ZW5kZWRQZGZWaWV3ZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBOZ3hIYXNIZWlnaHQge1xuICBwcml2YXRlIHJlYWRvbmx5IGZvcm1TdXBwb3J0ID0gbmV3IE5neEZvcm1TdXBwb3J0KCk7XG5cbiAgLyoqXG4gICAqIFRoZSBkdW1teSBjb21wb25lbnRzIGFyZSBpbnNlcnRlZCBhdXRvbWF0aWNhbGx5IHdoZW4gdGhlIHVzZXIgY3VzdG9taXplcyB0aGUgdG9vbGJhclxuICAgKiB3aXRob3V0IGFkZGluZyBldmVyeSBvcmlnaW5hbCB0b29sYmFyIGl0ZW0uIFdpdGhvdXQgdGhlIGR1bW15IGNvbXBvbmVudHMsIHRoZVxuICAgKiBpbml0aWFsaXphdGlvbiBjb2RlIG9mIHBkZi5qcyBjcmFzaGVzIGJlY2F1c2UgaXQgYXNzdW1lIHRoYXQgZXZlcnkgc3RhbmRhcmQgd2lkZ2V0IGlzIHRoZXJlLlxuICAgKi9cbiAgQFZpZXdDaGlsZChQZGZEdW1teUNvbXBvbmVudHNDb21wb25lbnQpXG4gIHB1YmxpYyBkdW1teUNvbXBvbmVudHM6IFBkZkR1bW15Q29tcG9uZW50c0NvbXBvbmVudDtcblxuICBAVmlld0NoaWxkKCdyb290JylcbiAgcHVibGljIHJvb3Q6IEVsZW1lbnRSZWY7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBhbm5vdGF0aW9uRWRpdG9yRXZlbnQgPSBuZXcgRXZlbnRFbWl0dGVyPEFubm90YXRpb25FZGl0b3JFdmVudD4oKTtcbiAgLyogVUkgdGVtcGxhdGVzICovXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBjdXN0b21GaW5kYmFySW5wdXRBcmVhOiBUZW1wbGF0ZVJlZjxhbnk+IHwgdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBjdXN0b21Ub29sYmFyOiBUZW1wbGF0ZVJlZjxhbnk+IHwgdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBjdXN0b21GaW5kYmFyOiBUZW1wbGF0ZVJlZjxhbnk+IHwgdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBjdXN0b21GaW5kYmFyQnV0dG9uczogVGVtcGxhdGVSZWY8YW55PiB8IHVuZGVmaW5lZDtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgY3VzdG9tUGRmVmlld2VyOiBUZW1wbGF0ZVJlZjxhbnk+IHwgdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBjdXN0b21TZWNvbmRhcnlUb29sYmFyOiBUZW1wbGF0ZVJlZjxhbnk+IHwgdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBjdXN0b21TaWRlYmFyOiBUZW1wbGF0ZVJlZjxhbnk+IHwgdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBjdXN0b21UaHVtYm5haWw6IFRlbXBsYXRlUmVmPGFueT4gfCB1bmRlZmluZWQ7XG5cbiAgQElucHV0KClcbiAgcHVibGljIGN1c3RvbUZyZWVGbG9hdGluZ0JhcjogVGVtcGxhdGVSZWY8YW55PiB8IHVuZGVmaW5lZDtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd0ZyZWVGbG9hdGluZ0JhciA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIGVuYWJsZURyYWdBbmREcm9wID0gdHJ1ZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgZm9yY2VVc2luZ0xlZ2FjeUVTNSA9IGZhbHNlO1xuXG4gIHB1YmxpYyBsb2NhbGl6YXRpb25Jbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgcmVzaXplT2JzZXJ2ZXI6IFJlc2l6ZU9ic2VydmVyIHwgdW5kZWZpbmVkO1xuXG4gIHByaXZhdGUgaW5pdGlhbEFuZ3VsYXJGb3JtRGF0YT86IEZvcm1EYXRhVHlwZSA9IHVuZGVmaW5lZDtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IGZvcm1EYXRhKGZvcm1EYXRhOiBGb3JtRGF0YVR5cGUpIHtcbiAgICBpZiAodGhpcy5pbml0aWFsQW5ndWxhckZvcm1EYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuaW5pdGlhbEFuZ3VsYXJGb3JtRGF0YSA9IGZvcm1EYXRhO1xuICAgIH1cbiAgICB0aGlzLmZvcm1TdXBwb3J0LmZvcm1EYXRhID0gZm9ybURhdGE7XG4gIH1cblxuICBASW5wdXQoKVxuICBwdWJsaWMgZGlzYWJsZUZvcm1zID0gZmFsc2U7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBnZXQgZm9ybURhdGFDaGFuZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZm9ybVN1cHBvcnQuZm9ybURhdGFDaGFuZ2U7XG4gIH1cblxuICBwdWJsaWMgX3BhZ2VWaWV3TW9kZTogUGFnZVZpZXdNb2RlVHlwZSA9ICdtdWx0aXBsZSc7XG5cbiAgcHVibGljIGJhc2VIcmVmOiBzdHJpbmc7XG5cbiAgLyoqIFRoaXMgZmxhZyBwcmV2ZW50cyB0cnlpbmcgdG8gbG9hZCBhIGZpbGUgdHdpY2UgaWYgdGhlIHVzZXIgdXBsb2FkcyBpdCB1c2luZyB0aGUgZmlsZSB1cGxvYWQgZGlhbG9nIG9yIHZpYSBkcmFnJ24nZHJvcCAqL1xuICBwcml2YXRlIHNyY0NoYW5nZVRyaWdnZXJlZEJ5VXNlcjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHB1YmxpYyBnZXQgcGFnZVZpZXdNb2RlKCk6IFBhZ2VWaWV3TW9kZVR5cGUge1xuICAgIHJldHVybiB0aGlzLl9wYWdlVmlld01vZGU7XG4gIH1cblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IHBhZ2VWaWV3TW9kZSh2aWV3TW9kZTogUGFnZVZpZXdNb2RlVHlwZSkge1xuICAgIGlmICghaXNQbGF0Zm9ybUJyb3dzZXIodGhpcy5wbGF0Zm9ybUlkKSkgcmV0dXJuO1xuXG4gICAgY29uc3QgaGFzQ2hhbmdlZCA9IHRoaXMuX3BhZ2VWaWV3TW9kZSAhPT0gdmlld01vZGU7XG4gICAgaWYgKCFoYXNDaGFuZ2VkKSByZXR1cm47XG5cbiAgICBjb25zdCBtdXN0UmVkcmF3ID0gIXRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5uZ3hFeHRlbmRlZFBkZlZpZXdlckluY29tcGxldGVseUluaXRpYWxpemVkICYmICh0aGlzLl9wYWdlVmlld01vZGUgPT09ICdib29rJyB8fCB2aWV3TW9kZSA9PT0gJ2Jvb2snKTtcbiAgICB0aGlzLl9wYWdlVmlld01vZGUgPSB2aWV3TW9kZTtcbiAgICB0aGlzLnBhZ2VWaWV3TW9kZUNoYW5nZS5lbWl0KHRoaXMuX3BhZ2VWaWV3TW9kZSk7XG5cbiAgICBjb25zdCBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM6IElQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMgPSB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucz8uc2V0KCdwYWdlVmlld01vZGUnLCB0aGlzLnBhZ2VWaWV3TW9kZSk7XG5cbiAgICBjb25zdCBQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uID0gdGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uO1xuICAgIGlmIChQREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLnBhZ2VWaWV3TW9kZSA9IHRoaXMuX3BhZ2VWaWV3TW9kZTtcbiAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmZpbmRDb250cm9sbGVyLl9wYWdlVmlld01vZGUgPSB0aGlzLl9wYWdlVmlld01vZGU7XG4gICAgfVxuXG4gICAgdGhpcy5oYW5kbGVWaWV3TW9kZSh2aWV3TW9kZSk7XG5cbiAgICBpZiAobXVzdFJlZHJhdykge1xuICAgICAgdGhpcy5yZWRyYXdWaWV3ZXIodmlld01vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlVmlld01vZGUodmlld01vZGU6IFBhZ2VWaWV3TW9kZVR5cGUpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHZpZXdNb2RlKSB7XG4gICAgICBjYXNlICdpbmZpbml0ZS1zY3JvbGwnOlxuICAgICAgICB0aGlzLmhhbmRsZUluZmluaXRlU2Nyb2xsTW9kZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NpbmdsZSc6XG4gICAgICAgIHRoaXMuaGFuZGxlU2luZ2xlUGFnZU1vZGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdib29rJzpcbiAgICAgICAgdGhpcy5oYW5kbGVCb29rTW9kZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ211bHRpcGxlJzpcbiAgICAgICAgdGhpcy5oYW5kbGVNdWx0aXBsZVBhZ2VNb2RlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5zY3JvbGxNb2RlID0gU2Nyb2xsTW9kZVR5cGUudmVydGljYWw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVJbmZpbml0ZVNjcm9sbE1vZGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2Nyb2xsTW9kZSA9PT0gU2Nyb2xsTW9kZVR5cGUucGFnZSB8fCB0aGlzLnNjcm9sbE1vZGUgPT09IFNjcm9sbE1vZGVUeXBlLmhvcml6b250YWwpIHtcbiAgICAgIHRoaXMuc2Nyb2xsTW9kZSA9IFNjcm9sbE1vZGVUeXBlLnZlcnRpY2FsO1xuICAgICAgdGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLmRpc3BhdGNoKCdzd2l0Y2hzY3JvbGxtb2RlJywgeyBtb2RlOiBOdW1iZXIodGhpcy5zY3JvbGxNb2RlKSB9KTtcbiAgICB9XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAvLyB0aGlzIHRpbWVvdXQgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgQElucHV0KCkgaXMgY2FsbGVkIGJlZm9yZSB0aGUgY2hpbGQgY29tcG9uZW50cyBhcmUgaW5pdGlhbGl6ZWRcbiAgICAgIC8vIChhbmQgdGhlIER5bmFtaWNDc3NDb21wb25lbnQgaXMgYSBjaGlsZCBjb21wb25lbnQpXG4gICAgICB0aGlzLmR5bmFtaWNDU1NDb21wb25lbnQucmVtb3ZlU2Nyb2xsYmFySW5JbmZpbml0ZVNjcm9sbE1vZGUoZmFsc2UsIHRoaXMucGFnZVZpZXdNb2RlLCB0aGlzLnByaW1hcnlNZW51VmlzaWJsZSwgdGhpcywgdGhpcy5sb2dMZXZlbCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBzaW5jZSBwZGYuanMsIG91ciBjdXN0b20gc2luZ2xlLXBhZ2UtbW9kZSBoYXMgYmVlbiByZXBsYWNlZCBieSB0aGUgc3RhbmRhcmQgc2Nyb2xsTW9kZT1cInBhZ2VcIlxuICBwcml2YXRlIGhhbmRsZVNpbmdsZVBhZ2VNb2RlKCk6IHZvaWQge1xuICAgIHRoaXMuc2Nyb2xsTW9kZSA9IFNjcm9sbE1vZGVUeXBlLnBhZ2U7XG4gICAgdGhpcy5fcGFnZVZpZXdNb2RlID0gJ3NpbmdsZSc7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZUJvb2tNb2RlKCk6IHZvaWQge1xuICAgIHRoaXMuc2hvd0JvcmRlcnMgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5zY3JvbGxNb2RlICE9PSBTY3JvbGxNb2RlVHlwZS52ZXJ0aWNhbCkge1xuICAgICAgdGhpcy5zY3JvbGxNb2RlID0gU2Nyb2xsTW9kZVR5cGUudmVydGljYWw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVNdWx0aXBsZVBhZ2VNb2RlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNjcm9sbE1vZGUgPT09IFNjcm9sbE1vZGVUeXBlLnBhZ2UpIHtcbiAgICAgIHRoaXMuc2Nyb2xsTW9kZSA9IFNjcm9sbE1vZGVUeXBlLnZlcnRpY2FsO1xuICAgIH1cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIC8vIHRoaXMgdGltZW91dCBpcyBuZWNlc3NhcnkgYmVjYXVzZSBASW5wdXQoKSBpcyBjYWxsZWQgYmVmb3JlIHRoZSBjaGlsZCBjb21wb25lbnRzIGFyZSBpbml0aWFsaXplZFxuICAgICAgLy8gKGFuZCB0aGUgRHluYW1pY0Nzc0NvbXBvbmVudCBpcyBhIGNoaWxkIGNvbXBvbmVudClcbiAgICAgIHRoaXMuZHluYW1pY0NTU0NvbXBvbmVudC5yZW1vdmVTY3JvbGxiYXJJbkluZmluaXRlU2Nyb2xsTW9kZSh0cnVlLCB0aGlzLnBhZ2VWaWV3TW9kZSwgdGhpcy5wcmltYXJ5TWVudVZpc2libGUsIHRoaXMsIHRoaXMubG9nTGV2ZWwpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZWRyYXdWaWV3ZXIodmlld01vZGU6IFBhZ2VWaWV3TW9kZVR5cGUpOiB2b2lkIHtcbiAgICBpZiAodmlld01vZGUgIT09ICdib29rJykge1xuICAgICAgY29uc3Qgbmd4ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICBjb25zdCB2aWV3ZXJDb250YWluZXIgPSBuZ3gucXVlcnlTZWxlY3RvcignI3ZpZXdlckNvbnRhaW5lcicpIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgdmlld2VyQ29udGFpbmVyLnN0eWxlLndpZHRoID0gJyc7XG4gICAgICB2aWV3ZXJDb250YWluZXIuc3R5bGUub3ZlcmZsb3cgPSAnJztcbiAgICAgIHZpZXdlckNvbnRhaW5lci5zdHlsZS5tYXJnaW5SaWdodCA9ICcnO1xuICAgICAgdmlld2VyQ29udGFpbmVyLnN0eWxlLm1hcmdpbkxlZnQgPSAnJztcbiAgICAgIGNvbnN0IHZpZXdlciA9IG5neC5xdWVyeVNlbGVjdG9yKCcjdmlld2VyJykgYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICB2aWV3ZXIuc3R5bGUubWF4V2lkdGggPSAnJztcbiAgICAgIHZpZXdlci5zdHlsZS5taW5XaWR0aCA9ICcnO1xuICAgIH1cbiAgICB0aGlzLm9wZW5QREYyKCk7XG4gIH1cblxuICBwdWJsaWMgbWFya0ZvckNoZWNrKCk6IHZvaWQge1xuICAgIHRoaXMuY2RyLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBwYWdlVmlld01vZGVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPFBhZ2VWaWV3TW9kZVR5cGU+KCk7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBwcm9ncmVzcyA9IG5ldyBFdmVudEVtaXR0ZXI8UHJvZ3Jlc3NCYXJFdmVudD4oKTtcblxuICBAVmlld0NoaWxkKCdwZGZTZWNvbmRhcnlUb29sYmFyQ29tcG9uZW50JylcbiAgcHJpdmF0ZSByZWFkb25seSBzZWNvbmRhcnlUb29sYmFyQ29tcG9uZW50OiBQZGZTZWNvbmRhcnlUb29sYmFyQ29tcG9uZW50O1xuXG4gIEBWaWV3Q2hpbGQoJ0R5bmFtaWNDc3NDb21wb25lbnQnKVxuICBwcml2YXRlIHJlYWRvbmx5IGR5bmFtaWNDU1NDb21wb25lbnQ6IER5bmFtaWNDc3NDb21wb25lbnQ7XG5cbiAgQFZpZXdDaGlsZCgncGRmc2lkZWJhcicpXG4gIHByaXZhdGUgcmVhZG9ubHkgc2lkZWJhckNvbXBvbmVudDogUGRmU2lkZWJhckNvbXBvbmVudDtcblxuICAvKiByZWd1bGFyIGF0dHJpYnV0ZXMgKi9cblxuICBwcml2YXRlIF9zcmM6IHN0cmluZyB8IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSB8IHsgcmFuZ2U6IGFueSB9IHwgdW5kZWZpbmVkO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgc3JjQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSBfc2Nyb2xsTW9kZTogU2Nyb2xsTW9kZVR5cGUgPSBTY3JvbGxNb2RlVHlwZS52ZXJ0aWNhbDtcblxuICBwdWJsaWMgZ2V0IHNjcm9sbE1vZGUoKTogU2Nyb2xsTW9kZVR5cGUge1xuICAgIHJldHVybiB0aGlzLl9zY3JvbGxNb2RlO1xuICB9XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNldCBzY3JvbGxNb2RlKHZhbHVlOiBTY3JvbGxNb2RlVHlwZSkge1xuICAgIGlmICh0aGlzLl9zY3JvbGxNb2RlICE9PSB2YWx1ZSkge1xuICAgICAgY29uc3QgUERGVmlld2VyQXBwbGljYXRpb246IElQREZWaWV3ZXJBcHBsaWNhdGlvbiA9IHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcbiAgICAgIGlmIChQREZWaWV3ZXJBcHBsaWNhdGlvbj8ucGRmVmlld2VyKSB7XG4gICAgICAgIGlmIChQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIuc2Nyb2xsTW9kZSAhPT0gTnVtYmVyKHRoaXMuc2Nyb2xsTW9kZSkpIHtcbiAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5kaXNwYXRjaCgnc3dpdGNoc2Nyb2xsbW9kZScsIHsgbW9kZTogTnVtYmVyKHRoaXMuc2Nyb2xsTW9kZSkgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX3Njcm9sbE1vZGUgPSB2YWx1ZTtcbiAgICAgIGlmICh0aGlzLl9zY3JvbGxNb2RlID09PSBTY3JvbGxNb2RlVHlwZS5wYWdlKSB7XG4gICAgICAgIGlmICh0aGlzLnBhZ2VWaWV3TW9kZSAhPT0gJ3NpbmdsZScpIHtcbiAgICAgICAgICB0aGlzLl9wYWdlVmlld01vZGUgPSAnc2luZ2xlJztcbiAgICAgICAgICB0aGlzLnBhZ2VWaWV3TW9kZUNoYW5nZS5lbWl0KHRoaXMucGFnZVZpZXdNb2RlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGlzLnBhZ2VWaWV3TW9kZSA9PT0gJ3NpbmdsZScgfHwgdGhpcy5fc2Nyb2xsTW9kZSA9PT0gU2Nyb2xsTW9kZVR5cGUuaG9yaXpvbnRhbCkge1xuICAgICAgICB0aGlzLl9wYWdlVmlld01vZGUgPSAnbXVsdGlwbGUnO1xuICAgICAgICB0aGlzLnBhZ2VWaWV3TW9kZUNoYW5nZS5lbWl0KHRoaXMucGFnZVZpZXdNb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBAT3V0cHV0KClcbiAgcHVibGljIHNjcm9sbE1vZGVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPFNjcm9sbE1vZGVUeXBlPigpO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBhdXRob3JpemF0aW9uOiBPYmplY3QgfCBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBodHRwSGVhZGVyczogT2JqZWN0IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBjb250ZXh0TWVudUFsbG93ZWQgPSB0cnVlO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgYWZ0ZXJQcmludCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIGJlZm9yZVByaW50ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgY3VycmVudFpvb21GYWN0b3IgPSBuZXcgRXZlbnRFbWl0dGVyPG51bWJlcj4oKTtcblxuICAvKiogVGhpcyBmaWVsZCBzdG9yZXMgdGhlIHByZXZpb3VzIHpvb20gbGV2ZWwgaWYgdGhlIHBhZ2UgaXMgZW5sYXJnZWQgd2l0aCBhIGRvdWJsZS10YXAgb3IgZG91YmxlLWNsaWNrICovXG4gIHByaXZhdGUgcHJldmlvdXNab29tOiBzdHJpbmcgfCBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgQElucHV0KClcbiAgcHVibGljIGVuYWJsZVByaW50ID0gdHJ1ZTtcblxuICBwdWJsaWMgZ2V0IGVuYWJsZVByaW50QXV0b1JvdGF0ZSgpIHtcbiAgICByZXR1cm4gcGRmRGVmYXVsdE9wdGlvbnMuZW5hYmxlUHJpbnRBdXRvUm90YXRlO1xuICB9XG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzZXQgZW5hYmxlUHJpbnRBdXRvUm90YXRlKHZhbHVlKSB7XG4gICAgcGRmRGVmYXVsdE9wdGlvbnMuZW5hYmxlUHJpbnRBdXRvUm90YXRlID0gdmFsdWU7XG4gICAgaWYgKHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5QREZWaWV3ZXJBcHBsaWNhdGlvbj8ucGRmVmlld2VyKSB7XG4gICAgICB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLmVuYWJsZVByaW50QXV0b1JvdGF0ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93VGV4dEVkaXRvcjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSAneHhsJztcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd1N0YW1wRWRpdG9yOiBSZXNwb25zaXZlVmlzaWJpbGl0eSA9ICd4eGwnO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93RHJhd0VkaXRvcjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSAneHhsJztcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd0hpZ2hsaWdodEVkaXRvcjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSAneHhsJztcblxuICAvKiogSG93IG1hbnkgbG9nIG1lc3NhZ2VzIHNob3VsZCBiZSBwcmludGVkP1xuICAgKiBMZWdhbCB2YWx1ZXM6IFZlcmJvc2l0eUxldmVsLklORk9TICg9IDUpLCBWZXJib3NpdHlMZXZlbC5XQVJOSU5HUyAoPSAxKSwgVmVyYm9zaXR5TGV2ZWwuRVJST1JTICg9IDApICovXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBsb2dMZXZlbCA9IFZlcmJvc2l0eUxldmVsLldBUk5JTkdTO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyByZWxhdGl2ZUNvb3Jkc09wdGlvbnM6IE9iamVjdCA9IHt9O1xuXG4gIC8qKiBVc2UgdGhlIG1pbmlmaWVkIChtaW5pZmllZEpTTGlicmFyaWVzPVwidHJ1ZVwiLCB3aGljaCBpcyB0aGUgZGVmYXVsdCkgb3IgdGhlIHVzZXItcmVhZGFibGUgcGRmLmpzIGxpYnJhcnkgKG1pbmlmaWVkSlNMaWJyYXJpZXM9XCJmYWxzZVwiKSAqL1xuICBwdWJsaWMgZ2V0IG1pbmlmaWVkSlNMaWJyYXJpZXMoKSB7XG4gICAgcmV0dXJuIHBkZkRlZmF1bHRPcHRpb25zLl9pbnRlcm5hbEZpbGVuYW1lU3VmZml4ID09PSAnLm1pbic7XG4gIH1cblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IG1pbmlmaWVkSlNMaWJyYXJpZXModmFsdWUpIHtcbiAgICBwZGZEZWZhdWx0T3B0aW9ucy5faW50ZXJuYWxGaWxlbmFtZVN1ZmZpeCA9IHZhbHVlID8gJy5taW4nIDogJyc7XG4gIH1cblxuICBwdWJsaWMgcHJpbWFyeU1lbnVWaXNpYmxlID0gdHJ1ZTtcblxuICAvKiogb3B0aW9uIHRvIGluY3JlYXNlIChvciByZWR1Y2UpIHByaW50IHJlc29sdXRpb24uIERlZmF1bHQgaXMgMTUwIChkcGkpLiBTZW5zaWJsZSB2YWx1ZXNcbiAgICogYXJlIDMwMCwgNjAwLCBhbmQgMTIwMC4gTm90ZSB0aGUgaW5jcmVhc2UgbWVtb3J5IGNvbnN1bXB0aW9uLCB3aGljaCBtYXkgZXZlbiByZXN1bHQgaW4gYSBicm93c2VyIGNyYXNoLiAqL1xuICBASW5wdXQoKVxuICBwdWJsaWMgcHJpbnRSZXNvbHV0aW9uID0gbnVsbDtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgcm90YXRpb246IDAgfCA5MCB8IDE4MCB8IDI3MDtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIHJvdGF0aW9uQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjwwIHwgOTAgfCAxODAgfCAyNzA+KCk7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBhbm5vdGF0aW9uTGF5ZXJSZW5kZXJlZCA9IG5ldyBFdmVudEVtaXR0ZXI8QW5ub3RhdGlvbkxheWVyUmVuZGVyZWRFdmVudD4oKTtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIGFubm90YXRpb25FZGl0b3JMYXllclJlbmRlcmVkID0gbmV3IEV2ZW50RW1pdHRlcjxBbm5vdGF0aW9uRWRpdG9yTGF5ZXJSZW5kZXJlZEV2ZW50PigpO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgeGZhTGF5ZXJSZW5kZXJlZCA9IG5ldyBFdmVudEVtaXR0ZXI8WGZhTGF5ZXJSZW5kZXJlZEV2ZW50PigpO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgb3V0bGluZUxvYWRlZCA9IG5ldyBFdmVudEVtaXR0ZXI8T3V0bGluZUxvYWRlZEV2ZW50PigpO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgYXR0YWNobWVudHNsb2FkZWQgPSBuZXcgRXZlbnRFbWl0dGVyPEF0dGFjaG1lbnRMb2FkZWRFdmVudD4oKTtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIGxheWVyc2xvYWRlZCA9IG5ldyBFdmVudEVtaXR0ZXI8TGF5ZXJzTG9hZGVkRXZlbnQ+KCk7XG5cbiAgcHVibGljIGhhc1NpZ25hdHVyZTogYm9vbGVhbjtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IHNyYyh1cmw6IHN0cmluZyB8IEFycmF5QnVmZmVyIHwgQmxvYiB8IFVpbnQ4QXJyYXkgfCBVUkwgfCB7IHJhbmdlOiBhbnkgfSkge1xuICAgIGlmICh1cmwgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICB0aGlzLl9zcmMgPSB1cmwuYnVmZmVyO1xuICAgIH0gZWxzZSBpZiAodXJsIGluc3RhbmNlb2YgVVJMKSB7XG4gICAgICB0aGlzLl9zcmMgPSB1cmwudG9TdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJyAmJiB1cmwgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aGlzLnNyYyA9IGF3YWl0IHRoaXMuY29udmVydEJsb2JUb1VpbnQ4QXJyYXkodXJsKTtcbiAgICAgICAgaWYgKHRoaXMuc2VydmljZS5uZ3hFeHRlbmRlZFBkZlZpZXdlckluaXRpYWxpemVkKSB7XG4gICAgICAgICAgaWYgKHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5uZ3hFeHRlbmRlZFBkZlZpZXdlckluY29tcGxldGVseUluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW5QREYoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgKGFzeW5jICgpID0+IHRoaXMub3BlblBERjIoKSkoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZWxzZSBvcGVuUERGIGlzIGNhbGxlZCBsYXRlciwgc28gd2UgZG8gbm90aGluZyB0byBwcmV2ZW50IGxvYWRpbmcgdGhlIFBERiBmaWxlIHR3aWNlXG4gICAgICAgIH1cbiAgICAgIH0pKCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdXJsID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fc3JjID0gdXJsO1xuICAgICAgaWYgKHVybC5sZW5ndGggPiA5ODApIHtcbiAgICAgICAgLy8gbWluaW1hbCBsZW5ndGggb2YgYSBiYXNlNjQgZW5jb2RlZCBQREZcbiAgICAgICAgaWYgKHVybC5sZW5ndGggJSA0ID09PSAwKSB7XG4gICAgICAgICAgaWYgKC9eW2EtekEtWlxcZC8rXSs9ezAsMn0kLy50ZXN0KHVybCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoZSBVUkwgbG9va3MgbGlrZSBhIGJhc2U2NCBlbmNvZGVkIHN0cmluZy4gSWYgc28sIHBsZWFzZSB1c2UgdGhlIGF0dHJpYnV0ZSBbYmFzZTY0U3JjXSBpbnN0ZWFkIG9mIFtzcmNdJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzLl9zcmMgYXMgYW55KSA9IHVybDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNvbnZlcnRCbG9iVG9VaW50OEFycmF5KGJsb2IpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgICAvLyBmaXJzdCB0cnkgdGhlIGFsZ29yaXRobSBmb3IgbW9kZXJuIGJyb3dzZXJzIGFuZCBub2RlLmpzXG4gICAgaWYgKGJsb2IuYXJyYXlCdWZmZXIpIHtcbiAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgYmxvYi5hcnJheUJ1ZmZlcigpO1xuICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKTtcbiAgICB9XG5cbiAgICAvLyB0aGVuIHRyeSB0aGUgb2xkLWZhc2hpb25lZCB3YXlcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VWludDhBcnJheT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiB7XG4gICAgICAgIGlmIChyZWFkZXIucmVzdWx0KSB7XG4gICAgICAgICAgcmVzb2x2ZShuZXcgVWludDhBcnJheShyZWFkZXIucmVzdWx0IGFzIEFycmF5QnVmZmVyKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignRXJyb3IgY29udmVydGluZyBCbG9iIHRvIFVpbnQ4QXJyYXknKSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZWFkZXIub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignRmlsZVJlYWRlciBlcnJvcicpKTtcbiAgICAgIH07XG4gICAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYik7XG4gICAgfSk7XG4gIH1cblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IGJhc2U2NFNyYyhiYXNlNjQ6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAoYmFzZTY0KSB7XG4gICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gc2VydmVyLXNpZGUgcmVuZGVyaW5nXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGJpbmFyeV9zdHJpbmcgPSBhdG9iKGJhc2U2NCk7XG4gICAgICBjb25zdCBsZW4gPSBiaW5hcnlfc3RyaW5nLmxlbmd0aDtcbiAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobGVuKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnlfc3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNyYyA9IGJ5dGVzLmJ1ZmZlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc3JjID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY29tYmluYXRpb24gb2YgaGVpZ2h0LCBtaW5IZWlnaHQsIGFuZCBhdXRvSGVpZ2h0IGVuc3VyZXMgdGhlIFBERiBoZWlnaHQgb2YgdGhlIFBERiB2aWV3ZXIgaXMgY2FsY3VsYXRlZCBjb3JyZWN0bHkgd2hlbiB0aGUgaGVpZ2h0IGlzIGEgcGVyY2VudGFnZS5cbiAgICogQnkgZGVmYXVsdCwgbWFueSBDU1MgZnJhbWV3b3JrcyBtYWtlIGEgZGl2IHdpdGggMTAwJSBoYXZlIGEgaGVpZ2h0IG9yIHplcm8gcGl4ZWxzLiBjaGVja0hlaWd0aCgpIGZpeGVzIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgYXV0b0hlaWdodCA9IGZhbHNlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBtaW5IZWlnaHQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBwcml2YXRlIF9oZWlnaHQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9ICcxMDAlJztcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IGhlaWdodChoOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgICB0aGlzLm1pbkhlaWdodCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmF1dG9IZWlnaHQgPSBmYWxzZTtcbiAgICBpZiAoaCkge1xuICAgICAgaWYgKGggPT09ICdhdXRvJykge1xuICAgICAgICB0aGlzLmF1dG9IZWlnaHQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9oZWlnaHQgPSB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9oZWlnaHQgPSBoO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhlaWdodCA9ICcxMDAlJztcbiAgICB9XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAvLyB0aGlzIHRpbWVvdXQgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgQElucHV0KCkgaXMgY2FsbGVkIGJlZm9yZSB0aGUgY2hpbGQgY29tcG9uZW50cyBhcmUgaW5pdGlhbGl6ZWRcbiAgICAgIC8vIChhbmQgdGhlIER5bmFtaWNDc3NDb21wb25lbnQgaXMgYSBjaGlsZCBjb21wb25lbnQpXG4gICAgICB0aGlzLmR5bmFtaWNDU1NDb21wb25lbnQuY2hlY2tIZWlnaHQodGhpcywgdGhpcy5sb2dMZXZlbCk7XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGhlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG5cbiAgQElucHV0KClcbiAgcHVibGljIGJhY2tncm91bmRDb2xvciA9ICcjZThlOGViJztcblxuICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIGRlZmluZSB0aGUgbmFtZSBvZiB0aGUgZmlsZSBhZnRlciBjbGlja2luZyBcImRvd25sb2FkXCIgKi9cbiAgQElucHV0KClcbiAgcHVibGljIGZpbGVuYW1lRm9yRG93bmxvYWQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIGRpc2FibGUgdGhlIGtleWJvYXJkIGJpbmRpbmdzIGNvbXBsZXRlbHkgKi9cbiAgQElucHV0KClcbiAgcHVibGljIGlnbm9yZUtleWJvYXJkID0gZmFsc2U7XG5cbiAgLyoqIEFsbG93cyB0aGUgdXNlciB0byBkaXNhYmxlIGEgbGlzdCBvZiBrZXkgYmluZGluZ3MuICovXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBpZ25vcmVLZXlzOiBBcnJheTxzdHJpbmc+ID0gW107XG5cbiAgLyoqIEFsbG93cyB0aGUgdXNlciB0byBlbmFibGUgYSBsaXN0IG9mIGtleSBiaW5kaW5ncyBleHBsaWNpdGx5LiBJZiB0aGlzIHByb3BlcnR5IGlzIHNldCwgZXZlcnkgb3RoZXIga2V5IGJpbmRpbmcgaXMgaWdub3JlZC4gKi9cbiAgQElucHV0KClcbiAgcHVibGljIGFjY2VwdEtleXM6IEFycmF5PHN0cmluZz4gPSBbXTtcblxuICBwdWJsaWMgaGFzVGV4dExheWVyID0gdHJ1ZTtcblxuICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIHB1dCB0aGUgdmlld2VyJ3Mgc3ZnIGltYWdlcyBpbnRvIGFuIGFyYml0cmFyeSBmb2xkZXIgKi9cbiAgQElucHV0KClcbiAgcHVibGljIGltYWdlUmVzb3VyY2VzUGF0aCA9IGFzc2V0c1VybChwZGZEZWZhdWx0T3B0aW9ucy5hc3NldHNGb2xkZXIpICsgJy9pbWFnZXMvJztcblxuICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIHB1dCB0aGVpciBsb2NhbGUgZm9sZGVyIGludG8gYW4gYXJiaXRyYXJ5IGZvbGRlciAqL1xuICBASW5wdXQoKVxuICBwdWJsaWMgbG9jYWxlRm9sZGVyUGF0aCA9IGFzc2V0c1VybChwZGZEZWZhdWx0T3B0aW9ucy5hc3NldHNGb2xkZXIpICsgJy9sb2NhbGUnO1xuXG4gIC8qKiBPdmVycmlkZSB0aGUgZGVmYXVsdCBsb2NhbGUuIFRoaXMgbXVzdCBiZSB0aGUgY29tcGxldGUgbG9jYWxlIG5hbWUsIHN1Y2ggYXMgXCJlcy1FU1wiLiBUaGUgc3RyaW5nIGlzIGFsbG93ZWQgdG8gYmUgYWxsIGxvd2VyY2FzZS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBsYW5ndWFnZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyAnZW4nIDogbmF2aWdhdG9yLmxhbmd1YWdlO1xuXG4gIC8qKiBCeSBkZWZhdWx0LCBsaXN0ZW5pbmcgdG8gdGhlIFVSTCBpcyBkZWFjdGl2YXRlZCBiZWNhdXNlIG9mdGVuIHRoZSBhbmNob3IgdGFnIGlzIHVzZWQgZm9yIHRoZSBBbmd1bGFyIHJvdXRlciAqL1xuICBASW5wdXQoKVxuICBwdWJsaWMgbGlzdGVuVG9VUkwgPSBmYWxzZTtcblxuICAvKiogTmF2aWdhdGUgdG8gYSBjZXJ0YWluIFwibmFtZWQgZGVzdGluYXRpb25cIiAqL1xuICBASW5wdXQoKVxuICBwdWJsaWMgbmFtZWRkZXN0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLyoqIGFsbG93cyB5b3UgdG8gcGFzcyBhIHBhc3N3b3JkIHRvIHJlYWQgcGFzc3dvcmQtcHJvdGVjdGVkIGZpbGVzICovXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBwYXNzd29yZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyByZXBsYWNlQnJvd3NlclByaW50ID0gdHJ1ZTtcblxuICBwcml2YXRlIHJlYWRvbmx5IG9yaWdpbmFsUHJpbnQgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5wcmludCA6IHVuZGVmaW5lZDtcblxuICBwdWJsaWMgX3Nob3dTaWRlYmFyQnV0dG9uOiBSZXNwb25zaXZlVmlzaWJpbGl0eSA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHVzZUlubGluZVNjcmlwdHMgPSB0cnVlO1xuXG4gIHB1YmxpYyB2aWV3ZXJQb3NpdGlvblRvcCA9ICczMnB4JztcblxuICAvKiogcGRmLmpzIGNhbiBzaG93IHNpZ25hdHVyZXMsIGJ1dCBmYWlscyB0byB2ZXJpZnkgdGhlbS4gU28gdGhleSBhcmUgc3dpdGNoZWQgb2ZmIGJ5IGRlZmF1bHQuXG4gICAqIFNldCBcIltzaG93VW52ZXJpZmllZFNpZ25hdHVyZXNdXCI9XCJ0cnVlXCIgdG8gZGlzcGxheSBlLXNpZ25hdHVyZXMgbm9uZXRoZWxlc3MuXG4gICAqL1xuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd1VudmVyaWZpZWRTaWduYXR1cmVzID0gZmFsc2U7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHN0YXJ0VGFiaW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICBwdWJsaWMgZ2V0IHNob3dTaWRlYmFyQnV0dG9uKCkge1xuICAgIHJldHVybiB0aGlzLl9zaG93U2lkZWJhckJ1dHRvbjtcbiAgfVxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IHNob3dTaWRlYmFyQnV0dG9uKHNob3c6IFJlc3BvbnNpdmVWaXNpYmlsaXR5KSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBzZXJ2ZXItc2lkZSByZW5kZXJpbmdcbiAgICAgIHRoaXMuX3Nob3dTaWRlYmFyQnV0dG9uID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3Nob3dTaWRlYmFyQnV0dG9uID0gc2hvdztcbiAgICBpZiAodGhpcy5fc2hvd1NpZGViYXJCdXR0b24pIHtcbiAgICAgIGNvbnN0IGlzSUUgPSAvbXNpZVxcc3x0cmlkZW50XFwvL2kudGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICBsZXQgZmFjdG9yID0gMTtcbiAgICAgIGlmIChpc0lFKSB7XG4gICAgICAgIGZhY3RvciA9IE51bWJlcigodGhpcy5fbW9iaWxlRnJpZW5kbHlab29tIHx8ICcxMDAnKS5yZXBsYWNlKCclJywgJycpKSAvIDEwMDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5maW5kYmFyTGVmdCA9ICg2OCAqIGZhY3RvcikudG9TdHJpbmcoKSArICdweCc7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmluZGJhckxlZnQgPSAnMHB4JztcbiAgfVxuXG4gIHByaXZhdGUgX3NpZGViYXJWaXNpYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBwdWJsaWMgZ2V0IHNpZGViYXJWaXNpYmxlKCk6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9zaWRlYmFyVmlzaWJsZTtcbiAgfVxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IHNpZGViYXJWaXNpYmxlKHZhbHVlOiBib29sZWFuIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9zaWRlYmFyVmlzaWJsZSkge1xuICAgICAgdGhpcy5zaWRlYmFyVmlzaWJsZUNoYW5nZS5lbWl0KHZhbHVlKTtcbiAgICB9XG4gICAgdGhpcy5fc2lkZWJhclZpc2libGUgPSB2YWx1ZTtcbiAgICBjb25zdCBQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uID0gdGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uO1xuICAgIGlmIChQREZWaWV3ZXJBcHBsaWNhdGlvbj8ucGRmU2lkZWJhcikge1xuICAgICAgaWYgKHRoaXMuc2lkZWJhclZpc2libGUpIHtcbiAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmU2lkZWJhci5vcGVuKCk7XG4gICAgICAgIGNvbnN0IHZpZXcgPSBOdW1iZXIodGhpcy5hY3RpdmVTaWRlYmFyVmlldyk7XG4gICAgICAgIGlmICh2aWV3ID09PSAxIHx8IHZpZXcgPT09IDIgfHwgdmlldyA9PT0gMyB8fCB2aWV3ID09PSA0KSB7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmU2lkZWJhci5zd2l0Y2hWaWV3KHZpZXcsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1thY3RpdmVTaWRlYmFyVmlld10gbXVzdCBiZSBhbiBpbnRlZ2VyIHZhbHVlIGJldHdlZW4gMSBhbmQgNCcpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZTaWRlYmFyLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBzaWRlYmFyVmlzaWJsZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4oKTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgYWN0aXZlU2lkZWJhclZpZXc6IFBkZlNpZGViYXJWaWV3ID0gUGRmU2lkZWJhclZpZXcuT1VUTElORTtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIGFjdGl2ZVNpZGViYXJWaWV3Q2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxQZGZTaWRlYmFyVmlldz4oKTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgZmluZGJhclZpc2libGUgPSBmYWxzZTtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIGZpbmRiYXJWaXNpYmxlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBwcm9wZXJ0aWVzRGlhbG9nVmlzaWJsZSA9IGZhbHNlO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgcHJvcGVydGllc0RpYWxvZ1Zpc2libGVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGJvb2xlYW4+KCk7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNob3dGaW5kQnV0dG9uOiBSZXNwb25zaXZlVmlzaWJpbGl0eSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd0ZpbmRIaWdobGlnaHRBbGwgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93RmluZE1hdGNoQ2FzZSA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNob3dGaW5kTXVsdGlwbGU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93RmluZFJlZ2V4cDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93RmluZEVudGlyZVdvcmQgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93RmluZE1hdGNoRGlhY3JpdGljcyA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNob3dGaW5kUmVzdWx0c0NvdW50ID0gdHJ1ZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd0ZpbmRNZXNzYWdlcyA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNob3dQYWdpbmdCdXR0b25zOiBSZXNwb25zaXZlVmlzaWJpbGl0eSA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNob3dGaXJzdEFuZExhc3RQYWdlQnV0dG9uczogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93UHJldmlvdXNBbmROZXh0UGFnZUJ1dHRvbnM6IFJlc3BvbnNpdmVWaXNpYmlsaXR5ID0gdHJ1ZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd1BhZ2VOdW1iZXI6IFJlc3BvbnNpdmVWaXNpYmlsaXR5ID0gdHJ1ZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd1BhZ2VMYWJlbDogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93Wm9vbUJ1dHRvbnM6IFJlc3BvbnNpdmVWaXNpYmlsaXR5ID0gdHJ1ZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd1pvb21Ecm9wZG93bjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93UHJlc2VudGF0aW9uTW9kZUJ1dHRvbjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSBmYWxzZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd09wZW5GaWxlQnV0dG9uOiBSZXNwb25zaXZlVmlzaWJpbGl0eSA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNob3dQcmludEJ1dHRvbjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93RG93bmxvYWRCdXR0b246IFJlc3BvbnNpdmVWaXNpYmlsaXR5ID0gdHJ1ZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgdGhlbWU6ICdkYXJrJyB8ICdsaWdodCcgfCAnY3VzdG9tJyB8IHN0cmluZyA9ICdsaWdodCc7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNob3dUb29sYmFyID0gdHJ1ZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd1NlY29uZGFyeVRvb2xiYXJCdXR0b246IFJlc3BvbnNpdmVWaXNpYmlsaXR5ID0gdHJ1ZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd1NpbmdsZVBhZ2VNb2RlQnV0dG9uOiBSZXNwb25zaXZlVmlzaWJpbGl0eSA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNob3dWZXJ0aWNhbFNjcm9sbEJ1dHRvbjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93SG9yaXpvbnRhbFNjcm9sbEJ1dHRvbjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93V3JhcHBlZFNjcm9sbEJ1dHRvbjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93SW5maW5pdGVTY3JvbGxCdXR0b246IFJlc3BvbnNpdmVWaXNpYmlsaXR5ID0gdHJ1ZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd0Jvb2tNb2RlQnV0dG9uOiBSZXNwb25zaXZlVmlzaWJpbGl0eSA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNldCBzaG93Um90YXRlQnV0dG9uKHZpc2liaWxpdHk6IFJlc3BvbnNpdmVWaXNpYmlsaXR5KSB7XG4gICAgdGhpcy5zaG93Um90YXRlQ3dCdXR0b24gPSB2aXNpYmlsaXR5O1xuICAgIHRoaXMuc2hvd1JvdGF0ZUNjd0J1dHRvbiA9IHZpc2liaWxpdHk7XG4gIH1cblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd1JvdGF0ZUN3QnV0dG9uOiBSZXNwb25zaXZlVmlzaWJpbGl0eSA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNob3dSb3RhdGVDY3dCdXR0b246IFJlc3BvbnNpdmVWaXNpYmlsaXR5ID0gdHJ1ZTtcblxuICBwcml2YXRlIF9oYW5kVG9vbCA9ICF0aGlzLmlzSU9TKCk7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNldCBoYW5kVG9vbChoYW5kVG9vbDogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLmlzSU9TKCkgJiYgaGFuZFRvb2wpIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBcIk9uIGlPUywgdGhlIGhhbmR0b29sIGRvZXNuJ3Qgd29yayByZWxpYWJseS4gUGx1cywgeW91IGRvbid0IG5lZWQgaXQgYmVjYXVzZSB0b3VjaCBnZXN0dXJlcyBhbGxvdyB5b3UgdG8gZGlzdGluZ3Vpc2ggZWFzaWx5IGJldHdlZW4gc3dpcGluZyBhbmQgc2VsZWN0aW5nIHRleHQuIFRoZXJlZm9yZSwgdGhlIGxpYnJhcnkgaWdub3JlcyB5b3VyIHNldHRpbmcuXCJcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2hhbmRUb29sID0gaGFuZFRvb2w7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGhhbmRUb29sKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9oYW5kVG9vbDtcbiAgfVxuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgaGFuZFRvb2xDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGJvb2xlYW4+KCk7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNob3dIYW5kVG9vbEJ1dHRvbjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSBmYWxzZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvd1NwcmVhZEJ1dHRvbjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93UHJvcGVydGllc0J1dHRvbjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93Qm9yZGVycyA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNwcmVhZDogU3ByZWFkVHlwZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IHNob3dTY3JvbGxpbmdCdXR0b25zKHNob3c6IFJlc3BvbnNpdmVWaXNpYmlsaXR5KSB7XG4gICAgdGhpcy5zaG93VmVydGljYWxTY3JvbGxCdXR0b24gPSBzaG93O1xuICAgIHRoaXMuc2hvd0hvcml6b250YWxTY3JvbGxCdXR0b24gPSBzaG93O1xuICAgIHRoaXMuc2hvd1dyYXBwZWRTY3JvbGxCdXR0b24gPSBzaG93O1xuICAgIHRoaXMuc2hvd0luZmluaXRlU2Nyb2xsQnV0dG9uID0gc2hvdztcbiAgICB0aGlzLnNob3dCb29rTW9kZUJ1dHRvbiA9IHNob3c7XG4gICAgdGhpcy5zaG93U2luZ2xlUGFnZU1vZGVCdXR0b24gPSBzaG93O1xuICB9XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBzcHJlYWRDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPCdvZmYnIHwgJ2V2ZW4nIHwgJ29kZCc+KCk7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyB0aHVtYm5haWxEcmF3biA9IG5ldyBFdmVudEVtaXR0ZXI8UGRmVGh1bWJuYWlsRHJhd25FdmVudD4oKTtcblxuICBwcml2YXRlIF9wYWdlOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgcHVibGljIGdldCBwYWdlKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX3BhZ2U7XG4gIH1cblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IHBhZ2UobmV3UGFnZU51bWJlcjogbnVtYmVyIHwgc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKG5ld1BhZ2VOdW1iZXIpIHtcbiAgICAgIC8vIHNpbGVudGx5IGNvcGUgd2l0aCBzdHJpbmdzXG4gICAgICB0aGlzLl9wYWdlID0gTnVtYmVyKG5ld1BhZ2VOdW1iZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wYWdlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgcGFnZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyIHwgdW5kZWZpbmVkPigpO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBwYWdlTGFiZWw6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIHBhZ2VMYWJlbENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nIHwgdW5kZWZpbmVkPigpO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgcGFnZXNMb2FkZWQgPSBuZXcgRXZlbnRFbWl0dGVyPFBhZ2VzTG9hZGVkRXZlbnQ+KCk7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBwYWdlUmVuZGVyID0gbmV3IEV2ZW50RW1pdHRlcjxQYWdlUmVuZGVyRXZlbnQ+KCk7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBwYWdlUmVuZGVyZWQgPSBuZXcgRXZlbnRFbWl0dGVyPFBhZ2VSZW5kZXJlZEV2ZW50PigpO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgcGRmRG93bmxvYWRlZCA9IG5ldyBFdmVudEVtaXR0ZXI8UGRmRG93bmxvYWRlZEV2ZW50PigpO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgcGRmTG9hZGVkID0gbmV3IEV2ZW50RW1pdHRlcjxQZGZMb2FkZWRFdmVudD4oKTtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIHBkZkxvYWRpbmdTdGFydHMgPSBuZXcgRXZlbnRFbWl0dGVyPFBkZkxvYWRpbmdTdGFydHNFdmVudD4oKTtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIHBkZkxvYWRpbmdGYWlsZWQgPSBuZXcgRXZlbnRFbWl0dGVyPEVycm9yPigpO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyB0ZXh0TGF5ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyB0ZXh0TGF5ZXJSZW5kZXJlZCA9IG5ldyBFdmVudEVtaXR0ZXI8VGV4dExheWVyUmVuZGVyZWRFdmVudD4oKTtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIGFubm90YXRpb25FZGl0b3JNb2RlQ2hhbmdlZCA9IG5ldyBFdmVudEVtaXR0ZXI8QW5ub3RhdGlvbkVkaXRvckVkaXRvck1vZGVDaGFuZ2VkRXZlbnQ+KCk7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyB1cGRhdGVGaW5kTWF0Y2hlc0NvdW50ID0gbmV3IEV2ZW50RW1pdHRlcjxGaW5kUmVzdWx0TWF0Y2hlc0NvdW50PigpO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgdXBkYXRlRmluZFN0YXRlID0gbmV3IEV2ZW50RW1pdHRlcjxGaW5kU3RhdGU+KCk7XG5cbiAgLyoqIExlZ2FsIHZhbHVlczogdW5kZWZpbmVkLCAnYXV0bycsICdwYWdlLWFjdHVhbCcsICdwYWdlLWZpdCcsICdwYWdlLXdpZHRoJywgb3IgJzUwJyAob3IgYW55IG90aGVyIHBlcmNlbnRhZ2UpICovXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyB6b29tOiBzdHJpbmcgfCBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyB6b29tQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmcgfCBudW1iZXIgfCB1bmRlZmluZWQ+KCk7XG5cbiAgcHJpdmF0ZSBfem9vbUxldmVscyA9IFsnYXV0bycsICdwYWdlLWFjdHVhbCcsICdwYWdlLWZpdCcsICdwYWdlLXdpZHRoJywgMC41LCAxLCAxLjI1LCAxLjUsIDIsIDMsIDRdO1xuXG4gIHB1YmxpYyBnZXQgem9vbUxldmVscygpIHtcbiAgICBpZiAodGhpcy5tYXhab29tICYmIHRoaXMubWF4Wm9vbSA9PT0gdGhpcy5taW5ab29tKSB7XG4gICAgICByZXR1cm4gW3RoaXMubWF4Wm9vbV07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl96b29tTGV2ZWxzO1xuICB9XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNldCB6b29tTGV2ZWxzKHZhbHVlKSB7XG4gICAgdGhpcy5fem9vbUxldmVscyA9IHZhbHVlO1xuICB9XG5cbiAgQElucHV0KClcbiAgcHVibGljIG1heFpvb20gPSAxMDtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgbWluWm9vbSA9IDAuMTtcblxuICAvKiogVGhpcyBhdHRyaWJ1dGUgYWxsb3dzIHlvdSB0byBpbmNyZWFzZSB0aGUgc2l6ZSBvZiB0aGUgVUkgZWxlbWVudHMgc28geW91IGNhbiB1c2UgdGhlbSBvbiBzbWFsbCBtb2JpbGUgZGV2aWNlcy5cbiAgICogVGhpcyBhdHRyaWJ1dGUgaXMgYSBzdHJpbmcgd2l0aCBhIHBlcmNlbnQgY2hhcmFjdGVyIGF0IHRoZSBlbmQgKGUuZy4gXCIxNTAlXCIpLlxuICAgKi9cbiAgcHVibGljIF9tb2JpbGVGcmllbmRseVpvb206IHN0cmluZyA9ICcxMDAlJztcblxuICBwdWJsaWMgbW9iaWxlRnJpZW5kbHlab29tU2NhbGUgPSAxO1xuXG4gIHB1YmxpYyB0b29sYmFyTWFyZ2luVG9wID0gJzBweCc7XG5cbiAgcHVibGljIHRvb2xiYXJXaWR0aCA9ICcxMDAlJztcblxuICBwcml2YXRlIHRvb2xiYXI6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIHB1YmxpYyBvblRvb2xiYXJMb2FkZWQodG9vbGJhckVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy50b29sYmFyID0gdG9vbGJhckVsZW1lbnQ7XG4gIH1cblxuICBwdWJsaWMgc2Vjb25kYXJ5VG9vbGJhclRvcDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIHB1YmxpYyBzaWRlYmFyUG9zaXRpb25Ub3A6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAvLyBkaXJ0eSBJRTExIGhhY2sgLSB0ZW1wb3Jhcnkgc29sdXRpb25cbiAgcHVibGljIGZpbmRiYXJUb3A6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAvLyBkaXJ0eSBJRTExIGhhY2sgLSB0ZW1wb3Jhcnkgc29sdXRpb25cbiAgcHVibGljIGZpbmRiYXJMZWZ0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXphdGlvblByb21pc2U6ICgoKSA9PiBQcm9taXNlPHZvaWQ+KSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNoZWNrUm9vdEVsZW1lbnRUaW1lb3V0OiBhbnk7XG4gIHByaXZhdGUgZGVzdHJveUluaXRpYWxpemF0aW9uID0gZmFsc2U7XG5cbiAgcHVibGljIGdldCBtb2JpbGVGcmllbmRseVpvb20oKSB7XG4gICAgcmV0dXJuIHRoaXMuX21vYmlsZUZyaWVuZGx5Wm9vbTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcGRmSnNWZXJzaW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGdldFZlcnNpb25TdWZmaXgocGRmRGVmYXVsdE9wdGlvbnMuYXNzZXRzRm9sZGVyKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWFqb3JNaW5vclBkZkpzVmVyc2lvbigpOiBzdHJpbmcge1xuICAgIGNvbnN0IGZ1bGxWZXJzaW9uID0gdGhpcy5wZGZKc1ZlcnNpb247XG4gICAgY29uc3QgcG9zID0gZnVsbFZlcnNpb24ubGFzdEluZGV4T2YoJy4nKTtcbiAgICByZXR1cm4gZnVsbFZlcnNpb24uc3Vic3RyaW5nKDAsIHBvcykucmVwbGFjZSgnLicsICctJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBhdHRyaWJ1dGVzIGFsbG93cyB5b3UgdG8gaW5jcmVhc2UgdGhlIHNpemUgb2YgdGhlIFVJIGVsZW1lbnRzIHNvIHlvdSBjYW4gdXNlIHRoZW0gb24gc21hbGwgbW9iaWxlIGRldmljZXMuXG4gICAqIFRoaXMgYXR0cmlidXRlIGlzIGEgc3RyaW5nIHdpdGggYSBwZXJjZW50IGNoYXJhY3RlciBhdCB0aGUgZW5kIChlLmcuIFwiMTUwJVwiKS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzZXQgbW9iaWxlRnJpZW5kbHlab29tKHpvb206IHN0cmluZykge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp0cmlwbGUtZXF1YWxzIC0gdGhlIHR5cGUgY29udmVyc2lvbiBpcyBpbnRlbmRlZFxuICAgIGlmICh6b29tID09ICd0cnVlJykge1xuICAgICAgem9vbSA9ICcxNTAlJztcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp0cmlwbGUtZXF1YWxzIC0gdGhlIHR5cGUgY29udmVyc2lvbiBpcyBpbnRlbmRlZFxuICAgIH0gZWxzZSBpZiAoem9vbSA9PSAnZmFsc2UnIHx8IHpvb20gPT09IHVuZGVmaW5lZCB8fCB6b29tID09PSBudWxsKSB7XG4gICAgICB6b29tID0gJzEwMCUnO1xuICAgIH1cbiAgICB0aGlzLl9tb2JpbGVGcmllbmRseVpvb20gPSB6b29tO1xuICAgIGxldCBmYWN0b3IgPSAxO1xuICAgIGlmICghU3RyaW5nKHpvb20pLmluY2x1ZGVzKCclJykpIHtcbiAgICAgIHpvb20gPSAxMDAgKiBOdW1iZXIoem9vbSkgKyAnJSc7XG4gICAgfVxuICAgIGZhY3RvciA9IE51bWJlcigoem9vbSB8fCAnMTAwJykucmVwbGFjZSgnJScsICcnKSkgLyAxMDA7XG4gICAgdGhpcy5tb2JpbGVGcmllbmRseVpvb21TY2FsZSA9IGZhY3RvcjtcbiAgICB0aGlzLnRvb2xiYXJXaWR0aCA9ICgxMDAgLyBmYWN0b3IpLnRvU3RyaW5nKCkgKyAnJSc7XG4gICAgdGhpcy50b29sYmFyTWFyZ2luVG9wID0gKGZhY3RvciAtIDEpICogMTYgKyAncHgnO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmNhbGNWaWV3ZXJQb3NpdGlvblRvcCgpKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXJ2ZXJTaWRlUmVuZGVyaW5nID0gdHJ1ZTtcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBjb2RlIGlzIHJ1bm5pbmcgaW4gYSBicm93c2VyIGVudmlyb25tZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBpc0Jyb3dzZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCc7XG4gIH1cblxuICBwdWJsaWMgY2FsY1ZpZXdlclBvc2l0aW9uVG9wKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pc0Jyb3dzZXIoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy50b29sYmFyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2lkZWJhclBvc2l0aW9uVG9wID0gJzAnO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0b3AgPSB0aGlzLnRvb2xiYXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIGlmICh0b3AgPCAzMykge1xuICAgICAgdGhpcy52aWV3ZXJQb3NpdGlvblRvcCA9ICczM3B4JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52aWV3ZXJQb3NpdGlvblRvcCA9IHRvcCArICdweCc7XG4gICAgfVxuXG4gICAgY29uc3QgZmFjdG9yID0gdG9wIC8gMzM7XG5cbiAgICBpZiAodGhpcy5wcmltYXJ5TWVudVZpc2libGUpIHtcbiAgICAgIHRoaXMuc2lkZWJhclBvc2l0aW9uVG9wID0gKDMzICsgMzMgKiAoZmFjdG9yIC0gMSkpLnRvU3RyaW5nKCkgKyAncHgnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNpZGViYXJQb3NpdGlvblRvcCA9ICcwJztcbiAgICB9XG4gICAgdGhpcy5zZWNvbmRhcnlUb29sYmFyVG9wID0gKDMzICsgMzggKiAoZmFjdG9yIC0gMSkpLnRvU3RyaW5nKCkgKyAncHgnO1xuICAgIHRoaXMuZmluZGJhclRvcCA9ICgzMyArIDM4ICogKGZhY3RvciAtIDEpKS50b1N0cmluZygpICsgJ3B4JztcblxuICAgIGNvbnN0IGZpbmRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJpbWFyeVZpZXdGaW5kJyk7XG4gICAgaWYgKGZpbmRCdXR0b24pIHtcbiAgICAgIGNvbnN0IGNvbnRhaW5lclBvc2l0aW9uTGVmdCA9IHRoaXMudG9vbGJhci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xuICAgICAgY29uc3QgZmluZEJ1dHRvblBvc2l0aW9uID0gZmluZEJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGNvbnN0IGxlZnQgPSBNYXRoLm1heCgwLCBmaW5kQnV0dG9uUG9zaXRpb24ubGVmdCAtIGNvbnRhaW5lclBvc2l0aW9uTGVmdCk7XG4gICAgICB0aGlzLmZpbmRiYXJMZWZ0ID0gbGVmdCArICdweCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNob3dTaWRlYmFyQnV0dG9uKSB7XG4gICAgICB0aGlzLmZpbmRiYXJMZWZ0ID0gKDM0ICsgMzIgKiBmYWN0b3IpLnRvU3RyaW5nKCkgKyAncHgnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZpbmRiYXJMZWZ0ID0gJzAnO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcmVhZG9ubHkgcGxhdGZvcm1JZCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG5vdGlmaWNhdGlvblNlcnZpY2U6IFBERk5vdGlmaWNhdGlvblNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbixcbiAgICBwdWJsaWMgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwdWJsaWMgc2VydmljZTogTmd4RXh0ZW5kZWRQZGZWaWV3ZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgICBwcml2YXRlIHJlYWRvbmx5IHBkZlNjcmlwdExvYWRlclNlcnZpY2U6IFBERlNjcmlwdExvYWRlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBrZXlib2FyZE1hbmFnZXI6IE5neEtleWJvYXJkTWFuYWdlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBjc3BQb2xpY3lTZXJ2aWNlOiBQZGZDc3BQb2xpY3lTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmVcbiAgKSB7XG4gICAgdGhpcy5iYXNlSHJlZiA9IHRoaXMucGxhdGZvcm1Mb2NhdGlvbi5nZXRCYXNlSHJlZkZyb21ET00oKTtcbiAgICBpZiAoaXNQbGF0Zm9ybUJyb3dzZXIodGhpcy5wbGF0Zm9ybUlkKSkge1xuICAgICAgdGhpcy5zZXJ2ZXJTaWRlUmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnRvb2xiYXJXaWR0aCA9IFN0cmluZyhkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaXNJT1MoKTogYm9vbGVhbiB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBzZXJ2ZXItc2lkZSByZW5kZXJpbmdcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIFsnaVBhZCBTaW11bGF0b3InLCAnaVBob25lIFNpbXVsYXRvcicsICdpUG9kIFNpbXVsYXRvcicsICdpUGFkJywgJ2lQaG9uZScsICdpUG9kJ10uaW5jbHVkZXMobmF2aWdhdG9yLnBsYXRmb3JtKSB8fFxuICAgICAgLy8gaVBhZCBvbiBpT1MgMTMgZGV0ZWN0aW9uXG4gICAgICAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnTWFjJykgJiYgJ29udG91Y2hlbmQnIGluIGRvY3VtZW50KVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIHJlcG9ydFNvdXJjZUNoYW5nZXMoY2hhbmdlOiB7IHNvdXJjZWZpbGU6IHN0cmluZyB9KTogdm9pZCB7XG4gICAgdGhpcy5fc3JjID0gY2hhbmdlLnNvdXJjZWZpbGU7XG4gICAgdGhpcy5zcmNDaGFuZ2VUcmlnZ2VyZWRCeVVzZXIgPSB0cnVlO1xuICAgIHRoaXMuc3JjQ2hhbmdlLmVtaXQoY2hhbmdlLnNvdXJjZWZpbGUpO1xuICAgIGNvbnN0IFBERlZpZXdlckFwcGxpY2F0aW9uOiBJUERGVmlld2VyQXBwbGljYXRpb24gPSB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb247XG4gICAgaWYgKHRoaXMuZmlsZW5hbWVGb3JEb3dubG9hZCkge1xuICAgICAgUERGVmlld2VyQXBwbGljYXRpb24uYXBwQ29uZmlnLmZpbGVuYW1lRm9yRG93bmxvYWQgPSB0aGlzLmZpbGVuYW1lRm9yRG93bmxvYWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmFwcENvbmZpZy5maWxlbmFtZUZvckRvd25sb2FkID0gdGhpcy5ndWVzc0ZpbGVuYW1lRnJvbVVybCh0aGlzLl9zcmMpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLmhpZGVUb29sYmFySWZJdElzRW1wdHkoKTtcbiAgICBpZiAoaXNQbGF0Zm9ybUJyb3dzZXIodGhpcy5wbGF0Zm9ybUlkKSkge1xuICAgICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICB0aGlzLmluaXRpYWxpemF0aW9uUHJvbWlzZSA9IHRoaXMuaW5pdGlhbGl6ZTtcbiAgICAgICAgdGhpcy5pbml0aWFsaXphdGlvblByb21pc2UoKTtcbiAgICAgIH0pO1xuXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLndhaXRGb3JSb290RWxlbWVudCgpO1xuXG4gICAgICBpZiAodGhpcy5kZXN0cm95SW5pdGlhbGl6YXRpb24pIHJldHVybjtcblxuICAgICAgaWYgKGlzUGxhdGZvcm1Ccm93c2VyKHRoaXMucGxhdGZvcm1JZCkpIHtcbiAgICAgICAgdGhpcy5hZGRUcmFuc2xhdGlvbnNVbmxlc3NQcm92aWRlZEJ5VGhlVXNlcigpO1xuICAgICAgICBhd2FpdCB0aGlzLndhaXRVbnRpbE9sZENvbXBvbmVudElzR29uZSgpO1xuICAgICAgICBpZiAodGhpcy5kZXN0cm95SW5pdGlhbGl6YXRpb24pIHJldHVybjtcblxuICAgICAgICBhd2FpdCB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuZW5zdXJlUGRmSnNIYXNCZWVuTG9hZGVkKHRoaXMudXNlSW5saW5lU2NyaXB0cywgdGhpcy5mb3JjZVVzaW5nTGVnYWN5RVM1KTtcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveUluaXRpYWxpemF0aW9uKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHRoaXMuZm9ybVN1cHBvcnQpIHtcbiAgICAgICAgICB0aGlzLmZvcm1TdXBwb3J0LnJlZ2lzdGVyRm9ybVN1cHBvcnRXaXRoUGRmanModGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uKTtcbiAgICAgICAgICB0aGlzLmtleWJvYXJkTWFuYWdlci5yZWdpc3RlcktleWJvYXJkTGlzdGVuZXIodGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uKTtcbiAgICAgICAgICB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb24uY3NwUG9saWN5U2VydmljZSA9IHRoaXMuY3NwUG9saWN5U2VydmljZTtcbiAgICAgICAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB0aGlzLmRvSW5pdFBERlZpZXdlcigpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdJbml0aWFsaXphdGlvbiBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgd2FpdEZvclJvb3RFbGVtZW50KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBjaGVja1Jvb3RFbGVtZW50ID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5kZXN0cm95SW5pdGlhbGl6YXRpb24pIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdDb21wb25lbnQgZGVzdHJveWVkJykpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnJvb3QgJiYgdGhpcy5yb290Lm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5yb290Lm5hdGl2ZUVsZW1lbnQub2Zmc2V0UGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuY2hlY2tSb290RWxlbWVudFRpbWVvdXQgPSBzZXRUaW1lb3V0KGNoZWNrUm9vdEVsZW1lbnQsIDUwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNoZWNrUm9vdEVsZW1lbnQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgd2FpdFVudGlsT2xkQ29tcG9uZW50SXNHb25lKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zZXJ2aWNlLm5neEV4dGVuZGVkUGRmVmlld2VySW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIDEwKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXNzaWduVGFiaW5kZXhlcygpIHtcbiAgICBpZiAodGhpcy5zdGFydFRhYmluZGV4KSB7XG4gICAgICBjb25zdCByID0gdGhpcy5yb290Lm5hdGl2ZUVsZW1lbnQuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgci5jbGFzc0xpc3QuYWRkKCdvZmZzY3JlZW4nKTtcbiAgICAgIHRoaXMuc2hvd0VsZW1lbnRzUmVjdXJzaXZlbHkocik7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHIpO1xuICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLmNvbGxlY3RFbGVtZW50UG9zaXRpb25zKHIsIHRoaXMucm9vdC5uYXRpdmVFbGVtZW50LCBbXSk7XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHIpO1xuICAgICAgY29uc3QgdG9wUmlnaHRHcmVhdGVyVGhhbkJvdHRvbUxlZnRDb21wYXJhdG9yID0gKGEsIGIpID0+IHtcbiAgICAgICAgaWYgKGEueSAtIGIueSA+IDE1KSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGIueSAtIGEueSA+IDE1KSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhLnggLSBiLng7XG4gICAgICB9O1xuICAgICAgY29uc3Qgc29ydGVkID0gWy4uLmVsZW1lbnRzXS5zb3J0KHRvcFJpZ2h0R3JlYXRlclRoYW5Cb3R0b21MZWZ0Q29tcGFyYXRvcik7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNvcnRlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICBzb3J0ZWRbaV0uZWxlbWVudC50YWJJbmRleCA9IHRoaXMuc3RhcnRUYWJpbmRleCArIGk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzaG93RWxlbWVudHNSZWN1cnNpdmVseShyb290OiBFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgY2xhc3Nlc1RvUmVtb3ZlID0gW1xuICAgICAgJ2hpZGRlbicsXG4gICAgICAnaW52aXNpYmxlJyxcbiAgICAgICdoaWRkZW5YWExWaWV3JyxcbiAgICAgICdoaWRkZW5YTFZpZXcnLFxuICAgICAgJ2hpZGRlbkxhcmdlVmlldycsXG4gICAgICAnaGlkZGVuTWVkaXVtVmlldycsXG4gICAgICAnaGlkZGVuU21hbGxWaWV3JyxcbiAgICAgICdoaWRkZW5UaW55VmlldycsXG4gICAgICAndmlzaWJsZVhYTFZpZXcnLFxuICAgICAgJ3Zpc2libGVYTFZpZXcnLFxuICAgICAgJ3Zpc2libGVMYXJnZVZpZXcnLFxuICAgICAgJ3Zpc2libGVNZWRpdW1WaWV3JyxcbiAgICAgICd2aXNpYmxlU21hbGxWaWV3JyxcbiAgICAgICd2aXNpYmxlVGlueVZpZXcnLFxuICAgIF07XG5cbiAgICByb290LmNsYXNzTGlzdC5yZW1vdmUoLi4uY2xhc3Nlc1RvUmVtb3ZlKTtcblxuICAgIGlmIChyb290IGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQgfHwgcm9vdCBpbnN0YW5jZW9mIEhUTUxBbmNob3JFbGVtZW50IHx8IHJvb3QgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50IHx8IHJvb3QgaW5zdGFuY2VvZiBIVE1MU2VsZWN0RWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAocm9vdC5jaGlsZEVsZW1lbnRDb3VudCA+IDApIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm9vdC5jaGlsZEVsZW1lbnRDb3VudDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGMgPSByb290LmNoaWxkcmVuLml0ZW0oaSk7XG4gICAgICAgIGlmIChjKSB7XG4gICAgICAgICAgdGhpcy5zaG93RWxlbWVudHNSZWN1cnNpdmVseShjKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29sbGVjdEVsZW1lbnRQb3NpdGlvbnMoY29weTogRWxlbWVudCwgb3JpZ2luYWw6IEVsZW1lbnQsIGVsZW1lbnRzOiBBcnJheTxFbGVtZW50QW5kUG9zaXRpb24+KTogQXJyYXk8RWxlbWVudEFuZFBvc2l0aW9uPiB7XG4gICAgaWYgKGNvcHkgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCB8fCBjb3B5IGluc3RhbmNlb2YgSFRNTEFuY2hvckVsZW1lbnQgfHwgY29weSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgfHwgY29weSBpbnN0YW5jZW9mIEhUTUxTZWxlY3RFbGVtZW50KSB7XG4gICAgICBjb25zdCByZWN0ID0gY29weS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGNvbnN0IGVsZW1lbnRBbmRQb3MgPSB7XG4gICAgICAgIGVsZW1lbnQ6IG9yaWdpbmFsLFxuICAgICAgICB4OiBNYXRoLnJvdW5kKHJlY3QubGVmdCksXG4gICAgICAgIHk6IE1hdGgucm91bmQocmVjdC50b3ApLFxuICAgICAgfSBhcyBFbGVtZW50QW5kUG9zaXRpb247XG4gICAgICBlbGVtZW50cy5wdXNoKGVsZW1lbnRBbmRQb3MpO1xuICAgIH0gZWxzZSBpZiAoY29weS5jaGlsZEVsZW1lbnRDb3VudCA+IDApIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29weS5jaGlsZEVsZW1lbnRDb3VudDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGMgPSBjb3B5LmNoaWxkcmVuLml0ZW0oaSk7XG4gICAgICAgIGNvbnN0IG8gPSBvcmlnaW5hbC5jaGlsZHJlbi5pdGVtKGkpO1xuICAgICAgICBpZiAoYyAmJiBvKSB7XG4gICAgICAgICAgZWxlbWVudHMgPSB0aGlzLmNvbGxlY3RFbGVtZW50UG9zaXRpb25zKGMsIG8sIGVsZW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudHM7XG4gIH1cblxuICBwcml2YXRlIHJlYWRvbmx5IGFmdGVyUHJpbnRMaXN0ZW5lciA9ICgpID0+IHtcbiAgICB0aGlzLmFmdGVyUHJpbnQuZW1pdCgpO1xuICB9O1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgYmVmb3JlUHJpbnRMaXN0ZW5lciA9ICgpID0+IHtcbiAgICB0aGlzLmJlZm9yZVByaW50LmVtaXQoKTtcbiAgfTtcblxuICBwcml2YXRlIGd1ZXNzRmlsZW5hbWVGcm9tVXJsKHNyYzogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHNyYyAmJiB0eXBlb2Ygc3JjID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3Qgc2xhc2ggPSBzcmMubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgIGlmIChzbGFzaCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHNyYy5zdWJzdHJpbmcoc2xhc2ggKyAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzcmM7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGRvSW5pdFBERlZpZXdlcigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIHNlcnZlci1zaWRlIHJlbmRlcmluZ1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNlcnZpY2Uubmd4RXh0ZW5kZWRQZGZWaWV3ZXJJbml0aWFsaXplZCkge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnF1b3RlbWFya1xuICAgICAgY29uc29sZS5lcnJvcihcIllvdSdyZSB0cnlpbmcgdG8gb3BlbiB0d28gaW5zdGFuY2VzIG9mIHRoZSBQREYgdmlld2VyLiBNb3N0IGxpa2VseSwgdGhpcyB3aWxsIHJlc3VsdCBpbiBlcnJvcnMuXCIpO1xuICAgIH1cbiAgICB0aGlzLm92ZXJyaWRlRGVmYXVsdFNldHRpbmdzKCk7XG4gICAgY29uc3Qgb25Mb2FkZWQgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5QREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cykge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXZlbnRidXMgaXMgbnVsbD8gTGV0J3MgdHJ5IGFnYWluLlwiKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgb25Mb2FkZWQoKTtcbiAgICAgICAgfSwgMTApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdzb3VyY2VjaGFuZ2VkJywgdGhpcy5yZXBvcnRTb3VyY2VDaGFuZ2VzLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXMub24oJ2FmdGVycHJpbnQnLCB0aGlzLmFmdGVyUHJpbnRMaXN0ZW5lcik7XG4gICAgICAgIHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5QREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbignYmVmb3JlcHJpbnQnLCB0aGlzLmJlZm9yZVByaW50TGlzdGVuZXIpO1xuICAgICAgICB0aGlzLmxvY2FsaXphdGlvbkluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKCF0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2Uuc2h1dHRpbmdEb3duKSB7XG4gICAgICAgICAgLy8gaHVycmllZCB1c2VycyBzb21ldGltZXMgcmVsb2FkIHRoZSBQREYgYmVmb3JlIGl0IGhhcyBmaW5pc2hlZCBpbml0aWFsaXppbmdcbiAgICAgICAgICB0aGlzLmNhbGNWaWV3ZXJQb3NpdGlvblRvcCgpO1xuICAgICAgICAgIHRoaXMuYWZ0ZXJMaWJyYXJ5SW5pdCgpO1xuICAgICAgICAgIHRoaXMub3BlblBERigpO1xuICAgICAgICAgIHRoaXMuYXNzaWduVGFiaW5kZXhlcygpO1xuICAgICAgICAgIGlmICh0aGlzLnJlcGxhY2VCcm93c2VyUHJpbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZG9SZXBsYWNlQnJvd3NlclByaW50KHRoaXMucmVwbGFjZUJyb3dzZXJQcmludCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd3ZWJ2aWV3ZXJpbml0aWFsaXplZCcsIG9uTG9hZGVkLCB7IG9uY2U6IHRydWUgfSk7XG5cbiAgICB0aGlzLmFjdGl2YXRlVGV4dGxheWVySWZOZWNlc3NhcnkobnVsbCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLnNodXR0aW5nRG93bikge1xuICAgICAgICAvLyBodXJyaWVkIHVzZXJzIHNvbWV0aW1lcyByZWxvYWQgdGhlIFBERiBiZWZvcmUgaXQgaGFzIGZpbmlzaGVkIGluaXRpYWxpemluZ1xuICAgICAgICAvLyBUaGlzIGluaXRpYWxpemVzIHRoZSB3ZWJ2aWV3ZXIsIHRoZSBmaWxlIG1heSBiZSBwYXNzZWQgaW4gdG8gaXQgdG8gaW5pdGlhbGl6ZSB0aGUgdmlld2VyIHdpdGggYSBwZGYgZGlyZWN0bHlcbiAgICAgICAgdGhpcy5pbml0UmVzaXplT2JzZXJ2ZXIoKTtcbiAgICAgICAgdGhpcy5vblJlc2l6ZSgpO1xuICAgICAgICB0aGlzLmhpZGVUb29sYmFySWZJdElzRW1wdHkoKTtcbiAgICAgICAgdGhpcy5kdW1teUNvbXBvbmVudHMuYWRkTWlzc2luZ1N0YW5kYXJkV2lkZ2V0cygpO1xuICAgICAgICBpZiAodGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucykge1xuICAgICAgICAgIGNvbnN0IFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9uczogSVBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucyA9IHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5QREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM7XG4gICAgICAgICAgKGdsb2JhbFRoaXMgYXMgYW55KS5QREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMgPSBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2Uud2ViVmlld2VyTG9hZCh0aGlzLmNzcFBvbGljeVNlcnZpY2UpO1xuXG4gICAgICAgIGNvbnN0IFBERlZpZXdlckFwcGxpY2F0aW9uOiBJUERGVmlld2VyQXBwbGljYXRpb24gPSB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb247XG4gICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmFwcENvbmZpZy5kZWZhdWx0VXJsID0gJyc7IC8vIElFIGJ1Z2ZpeFxuICAgICAgICBjb25zdCBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM6IElQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMgPSB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xuXG4gICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucy5zZXQoJ2VuYWJsZURyYWdBbmREcm9wJywgdGhpcy5lbmFibGVEcmFnQW5kRHJvcCk7XG4gICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucy5zZXQoJ2xvY2FsZVByb3BlcnRpZXMnLCB7IGxhbmc6IHRoaXMubGFuZ3VhZ2UgfSk7XG4gICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucy5zZXQoJ2ltYWdlUmVzb3VyY2VzUGF0aCcsIHRoaXMuaW1hZ2VSZXNvdXJjZXNQYXRoKTtcbiAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zLnNldCgnbWluWm9vbScsIHRoaXMubWluWm9vbSk7XG4gICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucy5zZXQoJ21heFpvb20nLCB0aGlzLm1heFpvb20pO1xuICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMuc2V0KCdwYWdlVmlld01vZGUnLCB0aGlzLnBhZ2VWaWV3TW9kZSk7XG4gICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucy5zZXQoJ3ZlcmJvc2l0eScsIHRoaXMubG9nTGV2ZWwpO1xuICAgICAgICBpZiAodGhpcy50aGVtZSA9PT0gJ2RhcmsnKSB7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zLnNldCgndmlld2VyQ3NzVGhlbWUnLCAyKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRoZW1lID09PSAnbGlnaHQnKSB7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zLnNldCgndmlld2VyQ3NzVGhlbWUnLCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmlzVmlld2VyRW1iZWRkZWQgPSB0cnVlO1xuICAgICAgICBpZiAoUERGVmlld2VyQXBwbGljYXRpb24ucHJpbnRLZXlEb3duTGlzdGVuZXIpIHtcbiAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIFBERlZpZXdlckFwcGxpY2F0aW9uLnByaW50S2V5RG93bkxpc3RlbmVyLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpO1xuICAgICAgICBpZiAoYm9keVswXSkge1xuICAgICAgICAgIGNvbnN0IHRvcExldmVsRWxlbWVudHMgPSBib2R5WzBdLmNoaWxkcmVuO1xuICAgICAgICAgIGZvciAobGV0IGkgPSB0b3BMZXZlbEVsZW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBlID0gdG9wTGV2ZWxFbGVtZW50cy5pdGVtKGkpO1xuICAgICAgICAgICAgaWYgKGUgJiYgZS5pZCA9PT0gJ3ByaW50Q29udGFpbmVyJykge1xuICAgICAgICAgICAgICBib2R5WzBdLnJlbW92ZUNoaWxkKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmludENvbnRhaW5lcicpO1xuICAgICAgICBpZiAocGMpIHtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLmFwcGVuZENoaWxkKHBjKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIDApO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUcmFuc2xhdGlvbnNVbmxlc3NQcm92aWRlZEJ5VGhlVXNlcigpIHtcbiAgICBjb25zdCBsaW5rID0gdGhpcy5yZW5kZXJlci5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgbGluay5yZWwgPSAncmVzb3VyY2UnO1xuICAgIGxpbmsudHlwZSA9ICdhcHBsaWNhdGlvbi9sMTBuJztcbiAgICBsaW5rLmhyZWYgPSB0aGlzLmxvY2FsZUZvbGRlclBhdGggKyAnL2xvY2FsZS5qc29uJztcblxuICAgIGxpbmsuc2V0QXR0cmlidXRlKCdvcmlnaW4nLCAnbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXInKTtcbiAgICB0aGlzLnJlbmRlcmVyLmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCBsaW5rKTtcbiAgfVxuXG4gIHByaXZhdGUgaGlkZVRvb2xiYXJJZkl0SXNFbXB0eSgpIHtcbiAgICB0aGlzLnByaW1hcnlNZW51VmlzaWJsZSA9IHRoaXMuc2hvd1Rvb2xiYXI7XG4gICAgaWYgKCF0aGlzLnNob3dTZWNvbmRhcnlUb29sYmFyQnV0dG9uIHx8IHRoaXMuc2VydmljZS5zZWNvbmRhcnlNZW51SXNFbXB0eSkge1xuICAgICAgaWYgKCF0aGlzLmlzUHJpbWFyeU1lbnVWaXNpYmxlKCkpIHtcbiAgICAgICAgdGhpcy5wcmltYXJ5TWVudVZpc2libGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogTm90aWZpZXMgZXZlcnkgd2lkZ2V0IHRoYXQgaW1wbGVtZW50cyBvbkxpYnJhcnlJbml0KCkgdGhhdCB0aGUgUERGIHZpZXdlciBvYmplY3RzIGFyZSBhdmFpbGFibGUgKi9cbiAgcHJpdmF0ZSBhZnRlckxpYnJhcnlJbml0KCkge1xuICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHRoaXMubm90aWZpY2F0aW9uU2VydmljZS5vblBERkpTSW5pdFNpZ25hbC5zZXQodGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uKSk7XG4gIH1cblxuICBwdWJsaWMgb25TcHJlYWRDaGFuZ2UobmV3U3ByZWFkOiAnb2ZmJyB8ICdldmVuJyB8ICdvZGQnKTogdm9pZCB7XG4gICAgdGhpcy5zcHJlYWRDaGFuZ2UuZW1pdChuZXdTcHJlYWQpO1xuICB9XG5cbiAgcHJpdmF0ZSByZWFkb25seSB0b2dnbGVWaXNpYmlsaXR5ID0gKGVsZW1lbnRJZDogc3RyaW5nLCBjc3NDbGFzcyA9ICdpbnZpc2libGUnKSA9PiB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnRJZCkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgZWxlbWVudD8uY2xhc3NMaXN0LnJlbW92ZShjc3NDbGFzcyk7XG4gIH07XG5cbiAgcHJpdmF0ZSBhY3RpdmF0ZVRleHRsYXllcklmTmVjZXNzYXJ5KG9wdGlvbnM6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHNldFRleHRMYXllck1vZGUgPSAobW9kZTogbnVtYmVyKSA9PiB7XG4gICAgICBvcHRpb25zPy5zZXQoJ3RleHRMYXllck1vZGUnLCBtb2RlKTtcbiAgICAgIHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXI/LnNldFRleHRMYXllck1vZGUobW9kZSk7XG4gICAgfTtcblxuICAgIGlmICh0aGlzLnRleHRMYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXRoaXMuaGFuZFRvb2wpIHtcbiAgICAgICAgc2V0VGV4dExheWVyTW9kZShwZGZEZWZhdWx0T3B0aW9ucy50ZXh0TGF5ZXJNb2RlKTtcbiAgICAgICAgdGhpcy50ZXh0TGF5ZXIgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5zaG93RmluZEJ1dHRvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5zaG93RmluZEJ1dHRvbiA9IHRydWU7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZVZpc2liaWxpdHkoJ3ZpZXdGaW5kJyk7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZVZpc2liaWxpdHkoJ2ZpbmRiYXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGV4dExheWVyTW9kZSh0aGlzLnNob3dIYW5kVG9vbEJ1dHRvbiA/IHBkZkRlZmF1bHRPcHRpb25zLnRleHRMYXllck1vZGUgOiAwKTtcblxuICAgICAgICBpZiAoIXRoaXMuc2hvd0hhbmRUb29sQnV0dG9uKSB7XG4gICAgICAgICAgaWYgKHRoaXMuc2hvd0ZpbmRCdXR0b24gfHwgdGhpcy5zaG93RmluZEJ1dHRvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuc2hvd0ZpbmRCdXR0b24gPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMubG9nTGV2ZWwgPj0gVmVyYm9zaXR5TGV2ZWwuV0FSTklOR1MpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICAgICAgICAgICAgICAnSGlkaW5nIHRoZSBcImZpbmRcIiBidXR0b24gYmVjYXVzZSB0aGUgdGV4dCBsYXllciBvZiB0aGUgUERGIGZpbGUgaXMgbm90IHJlbmRlcmVkLiBVc2UgW3RleHRMYXllcl09XCJ0cnVlXCIgdG8gZW5hYmxlIHRoZSBmaW5kIGJ1dHRvbi4nXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLnNob3dIYW5kVG9vbEJ1dHRvbikge1xuICAgICAgICAgICAgaWYgKHRoaXMubG9nTGV2ZWwgPj0gVmVyYm9zaXR5TGV2ZWwuV0FSTklOR1MpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICAgICAgICAgICAgICAnSGlkaW5nIHRoZSBcImhhbmQgdG9vbCAvIHNlbGVjdGlvbiBtb2RlXCIgbWVudSBiZWNhdXNlIHRoZSB0ZXh0IGxheWVyIG9mIHRoZSBQREYgZmlsZSBpcyBub3QgcmVuZGVyZWQuIFVzZSBbdGV4dExheWVyXT1cInRydWVcIiB0byBlbmFibGUgdGhlIHRoZSBtZW51IGl0ZW1zLidcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgdGhpcy5zaG93SGFuZFRvb2xCdXR0b24gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2V0VGV4dExheWVyTW9kZShwZGZEZWZhdWx0T3B0aW9ucy50ZXh0TGF5ZXJNb2RlKTtcbiAgICAgIHRoaXMudGV4dExheWVyID0gdHJ1ZTtcbiAgICAgIGlmICh0aGlzLnNob3dGaW5kQnV0dG9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5zaG93RmluZEJ1dHRvbiA9IHRydWU7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudG9nZ2xlVmlzaWJpbGl0eSgndmlld0ZpbmQnKTtcbiAgICAgICAgICB0aGlzLnRvZ2dsZVZpc2liaWxpdHkoJ2ZpbmRiYXInKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBvdmVycmlkZURlZmF1bHRTZXR0aW5ncygpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjsgLy8gc2VydmVyIHNpZGUgcmVuZGVyaW5nXG4gICAgfVxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpmb3JpblxuICAgIGNvbnN0IG9wdGlvbnNUb0lnbm9yZSA9IFtcbiAgICAgICduZWVkc0VTNScsXG4gICAgICAncmFuZ2VDaHVua1NpemUnLFxuICAgICAgJ19pbnRlcm5hbEZpbGVuYW1lU3VmZml4JyxcbiAgICAgICdhc3NldHNGb2xkZXInLFxuICAgICAgJ2RvdWJsZVRhcFpvb21GYWN0b3InLFxuICAgICAgJ2RvdWJsZVRhcFpvb21zSW5IYW5kTW9kZScsXG4gICAgICAnZG91YmxlVGFwWm9vbXNJblRleHRTZWxlY3Rpb25Nb2RlJyxcbiAgICAgICdkb3VibGVUYXBSZXNldHNab29tT25TZWNvbmREb3VibGVUYXAnLFxuICAgIF07XG4gICAgZm9yIChjb25zdCBrZXkgaW4gcGRmRGVmYXVsdE9wdGlvbnMpIHtcbiAgICAgIGlmICghb3B0aW9uc1RvSWdub3JlLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gcGRmRGVmYXVsdE9wdGlvbnNba2V5XTtcbiAgICAgICAgaWYgKGtleSAhPT0gJ2ZpbmRDb250cm9sbGVyJyAmJiB0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb3B0aW9ucy5zZXQoa2V5LCBvcHRpb24oKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3B0aW9ucy5zZXQoa2V5LCBwZGZEZWZhdWx0T3B0aW9uc1trZXldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBvcHRpb25zLnNldCgnZGlzYWJsZVByZWZlcmVuY2VzJywgdHJ1ZSk7XG4gICAgYXdhaXQgdGhpcy5zZXRab29tKCk7XG5cbiAgICB0aGlzLmtleWJvYXJkTWFuYWdlci5pZ25vcmVLZXlib2FyZCA9IHRoaXMuaWdub3JlS2V5Ym9hcmQ7XG4gICAgdGhpcy5rZXlib2FyZE1hbmFnZXIuaWdub3JlS2V5cyA9IHRoaXMuaWdub3JlS2V5cztcbiAgICB0aGlzLmtleWJvYXJkTWFuYWdlci5hY2NlcHRLZXlzID0gdGhpcy5hY2NlcHRLZXlzO1xuICAgIHRoaXMuYWN0aXZhdGVUZXh0bGF5ZXJJZk5lY2Vzc2FyeShvcHRpb25zKTtcblxuICAgIGlmICh0aGlzLnNjcm9sbE1vZGUgfHwgdGhpcy5zY3JvbGxNb2RlID09PSBTY3JvbGxNb2RlVHlwZS52ZXJ0aWNhbCkge1xuICAgICAgb3B0aW9ucy5zZXQoJ3Njcm9sbE1vZGVPbkxvYWQnLCB0aGlzLnNjcm9sbE1vZGUpO1xuICAgIH1cblxuICAgIGNvbnN0IHNpZGViYXJWaXNpYmxlID0gdGhpcy5zaWRlYmFyVmlzaWJsZTtcbiAgICBjb25zdCBQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uID0gdGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uO1xuXG4gICAgaWYgKHNpZGViYXJWaXNpYmxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnNpZGViYXJWaWV3T25Mb2FkID0gc2lkZWJhclZpc2libGUgPyAxIDogMDtcbiAgICAgIGlmIChQREZWaWV3ZXJBcHBsaWNhdGlvbi5hcHBDb25maWcpIHtcbiAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24uYXBwQ29uZmlnLnNpZGViYXJWaWV3T25Mb2FkID0gc2lkZWJhclZpc2libGUgPyB0aGlzLmFjdGl2ZVNpZGViYXJWaWV3IDogUGRmU2lkZWJhclZpZXcuTk9ORTtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMuc2V0KCdzaWRlYmFyVmlld09uTG9hZCcsIHRoaXMuc2lkZWJhclZpc2libGUgPyB0aGlzLmFjdGl2ZVNpZGViYXJWaWV3IDogMCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnNwcmVhZCA9PT0gJ2V2ZW4nKSB7XG4gICAgICBvcHRpb25zLnNldCgnc3ByZWFkTW9kZU9uTG9hZCcsIDIpO1xuICAgICAgaWYgKFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZlZpZXdlcikge1xuICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIuc3ByZWFkTW9kZSA9IDI7XG4gICAgICB9XG4gICAgICB0aGlzLm9uU3ByZWFkQ2hhbmdlKCdldmVuJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNwcmVhZCA9PT0gJ29kZCcpIHtcbiAgICAgIG9wdGlvbnMuc2V0KCdzcHJlYWRNb2RlT25Mb2FkJywgMSk7XG4gICAgICBpZiAoUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyKSB7XG4gICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZlZpZXdlci5zcHJlYWRNb2RlID0gMTtcbiAgICAgIH1cbiAgICAgIHRoaXMub25TcHJlYWRDaGFuZ2UoJ29kZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zLnNldCgnc3ByZWFkTW9kZU9uTG9hZCcsIDApO1xuICAgICAgaWYgKFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZlZpZXdlcikge1xuICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIuc3ByZWFkTW9kZSA9IDA7XG4gICAgICB9XG4gICAgICB0aGlzLm9uU3ByZWFkQ2hhbmdlKCdvZmYnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucHJpbnRSZXNvbHV0aW9uKSB7XG4gICAgICBvcHRpb25zLnNldCgncHJpbnRSZXNvbHV0aW9uJywgdGhpcy5wcmludFJlc29sdXRpb24pO1xuICAgIH1cbiAgICBpZiAodGhpcy5zaG93Qm9yZGVycyA9PT0gZmFsc2UpIHtcbiAgICAgIG9wdGlvbnMuc2V0KCdyZW1vdmVQYWdlQm9yZGVycycsICF0aGlzLnNob3dCb3JkZXJzKTtcbiAgICB9XG4gICAgY29uc3QgUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zOiBJUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zID0gdGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMuc2V0KCdsb2NhbGVQcm9wZXJ0aWVzJywgeyBsYW5nOiB0aGlzLmxhbmd1YWdlIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBvcGVuUERGKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IFBERlZpZXdlckFwcGxpY2F0aW9uOiBJUERGVmlld2VyQXBwbGljYXRpb24gPSB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb247XG4gICAgUERGVmlld2VyQXBwbGljYXRpb24uc2VydmljZVdvcmtlck9wdGlvbnMuc2hvd1VudmVyaWZpZWRTaWduYXR1cmVzID0gdGhpcy5zaG93VW52ZXJpZmllZFNpZ25hdHVyZXM7XG4gICAgUERGVmlld2VyQXBwbGljYXRpb24uZW5hYmxlUHJpbnQgPSB0aGlzLmVuYWJsZVByaW50O1xuICAgIGlmICh0aGlzLmZpbGVuYW1lRm9yRG93bmxvYWQpIHtcbiAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmFwcENvbmZpZy5maWxlbmFtZUZvckRvd25sb2FkID0gdGhpcy5maWxlbmFtZUZvckRvd25sb2FkO1xuICAgIH0gZWxzZSB7XG4gICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5hcHBDb25maWcuZmlsZW5hbWVGb3JEb3dubG9hZCA9IHRoaXMuZ3Vlc3NGaWxlbmFtZUZyb21VcmwodGhpcy5fc3JjKTtcbiAgICB9XG4gICAgdGhpcy5zZXJ2aWNlLm5neEV4dGVuZGVkUGRmVmlld2VySW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIHRoaXMucmVnaXN0ZXJFdmVudExpc3RlbmVycyhQREZWaWV3ZXJBcHBsaWNhdGlvbik7XG4gICAgdGhpcy5zZWxlY3RDdXJzb3JUb29sKCk7XG4gICAgaWYgKCF0aGlzLmxpc3RlblRvVVJMKSB7XG4gICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZMaW5rU2VydmljZS5zZXRIYXNoID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9zcmMpIHtcbiAgICAgIHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5uZ3hFeHRlbmRlZFBkZlZpZXdlckluY29tcGxldGVseUluaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICAgIHNldFRpbWVvdXQoYXN5bmMgKCkgPT4gdGhpcy5keW5hbWljQ1NTQ29tcG9uZW50LmNoZWNrSGVpZ2h0KHRoaXMsIHRoaXMubG9nTGV2ZWwpLCAxMDApO1xuICAgICAgLy8gb3BlbiBhIGZpbGUgaW4gdGhlIHZpZXdlclxuICAgICAgaWYgKCEhdGhpcy5fc3JjKSB7XG4gICAgICAgIGxldCB3b3JrZXJTcmM6IHN0cmluZyB8ICgoKSA9PiBzdHJpbmcpID0gcGRmRGVmYXVsdE9wdGlvbnMud29ya2VyU3JjO1xuICAgICAgICBpZiAodHlwZW9mIHdvcmtlclNyYyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHdvcmtlclNyYyA9IHdvcmtlclNyYygpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IGFueSA9IHtcbiAgICAgICAgICBwYXNzd29yZDogdGhpcy5wYXNzd29yZCxcbiAgICAgICAgICB2ZXJib3NpdHk6IHRoaXMubG9nTGV2ZWwsXG4gICAgICAgICAgd29ya2VyU3JjLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5fc3JjWydyYW5nZSddKSB7XG4gICAgICAgICAgb3B0aW9ucy5yYW5nZSA9IHRoaXMuX3NyY1sncmFuZ2UnXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5odHRwSGVhZGVycykge1xuICAgICAgICAgIG9wdGlvbnMuaHR0cEhlYWRlcnMgPSB0aGlzLmh0dHBIZWFkZXJzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF1dGhvcml6YXRpb24pIHtcbiAgICAgICAgICBvcHRpb25zLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuYXV0aG9yaXphdGlvbiAhPSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5odHRwSGVhZGVycykgb3B0aW9ucy5odHRwSGVhZGVycyA9IHt9O1xuXG4gICAgICAgICAgICBvcHRpb25zLmh0dHBIZWFkZXJzLkF1dGhvcml6YXRpb24gPSB0aGlzLmF1dGhvcml6YXRpb247XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMuYmFzZUhyZWYgPSB0aGlzLmJhc2VIcmVmO1xuICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5vbkVycm9yID0gKGVycm9yOiBFcnJvcikgPT4gdGhpcy5wZGZMb2FkaW5nRmFpbGVkLmVtaXQoZXJyb3IpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuX3NyYyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBvcHRpb25zLnVybCA9IHRoaXMuX3NyYztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9zcmMgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIG9wdGlvbnMuZGF0YSA9IHRoaXMuX3NyYztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9zcmMgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgb3B0aW9ucy5kYXRhID0gdGhpcy5fc3JjO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMucmFuZ2VDaHVua1NpemUgPSBwZGZEZWZhdWx0T3B0aW9ucy5yYW5nZUNodW5rU2l6ZTtcbiAgICAgICAgb3B0aW9ucy5jc3BQb2xpY3lTZXJ2aWNlID0gdGhpcy5jc3BQb2xpY3lTZXJ2aWNlO1xuICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5maW5kQmFyPy5jbG9zZSgpO1xuICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5zZWNvbmRhcnlUb29sYmFyPy5jbG9zZSgpO1xuICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5kaXNwYXRjaCgnYW5ub3RhdGlvbmVkaXRvcm1vZGVjaGFuZ2VkJywge21vZGU6IDB9KTtcblxuICAgICAgICBhd2FpdCBQREZWaWV3ZXJBcHBsaWNhdGlvbi5vcGVuKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLnBkZkxvYWRpbmdTdGFydHMuZW1pdCh7fSk7XG4gICAgICAgIHNldFRpbWVvdXQoYXN5bmMgKCkgPT4gdGhpcy5zZXRab29tKCkpO1xuICAgICAgfVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLnNodXR0aW5nRG93bikge1xuICAgICAgICAgIC8vIGh1cnJpZWQgdXNlcnMgc29tZXRpbWVzIHJlbG9hZCB0aGUgUERGIGJlZm9yZSBpdCBoYXMgZmluaXNoZWQgaW5pdGlhbGl6aW5nXG4gICAgICAgICAgaWYgKHRoaXMucGFnZSkge1xuICAgICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGFnZSA9IE51bWJlcih0aGlzLnBhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgMTAwKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyRXZlbnRMaXN0ZW5lcnMoUERGVmlld2VyQXBwbGljYXRpb246IElQREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdhbm5vdGF0aW9uLWVkaXRvci1ldmVudCcsICh4OiBBbm5vdGF0aW9uRWRpdG9yRXZlbnQpID0+IHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9uRWRpdG9yRXZlbnQuZW1pdCh4KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXMub24oJ3RvZ2dsZVNpZGViYXInLCAoeDogVG9nZ2xlU2lkZWJhckV2ZW50KSA9PiB7XG4gICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgIHRoaXMuc2lkZWJhclZpc2libGUgPSB4LnZpc2libGU7XG4gICAgICAgIHRoaXMuc2lkZWJhclZpc2libGVDaGFuZ2UuZW1pdCh4LnZpc2libGUpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbigndGV4dGxheWVycmVuZGVyZWQnLCAoeDogVGV4dExheWVyUmVuZGVyZWRFdmVudCkgPT4ge1xuICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4gdGhpcy50ZXh0TGF5ZXJSZW5kZXJlZC5lbWl0KHgpKTtcbiAgICB9KTtcblxuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdhbm5vdGF0aW9uZWRpdG9ybW9kZWNoYW5nZWQnLCAoeDogQW5ub3RhdGlvbkVkaXRvckVkaXRvck1vZGVDaGFuZ2VkRXZlbnQpID0+IHtcbiAgICAgIC8vIHdlJ3JlIHVzaW5nIGEgdGltZW91dCBoZXJlIHRvIG1ha2Ugc3VyZSB0aGUgZWRpdG9yIGlzIGFscmVhZHkgdmlzaWJsZVxuICAgICAgLy8gd2hlbiB0aGUgZXZlbnQgaXMgY2F1Z2h0LiBQZGYuanMgZmlyZXMgaXQgYSBiaXQgZWFybHkuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuYW5ub3RhdGlvbkVkaXRvck1vZGVDaGFuZ2VkLmVtaXQoeCkpO1xuICAgIH0pO1xuXG4gICAgUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXMub24oJ3Njcm9sbG1vZGVjaGFuZ2VkJywgKHg6IFNjcm9sbE1vZGVDaGFuZ2VkRXZlbnQpID0+IHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsTW9kZSA9IHgubW9kZTtcbiAgICAgICAgdGhpcy5zY3JvbGxNb2RlQ2hhbmdlLmVtaXQoeC5tb2RlKTtcbiAgICAgICAgaWYgKHgubW9kZSA9PT0gU2Nyb2xsTW9kZVR5cGUucGFnZSkge1xuICAgICAgICAgIGlmICh0aGlzLnBhZ2VWaWV3TW9kZSAhPT0gJ3NpbmdsZScpIHtcbiAgICAgICAgICAgIHRoaXMucGFnZVZpZXdNb2RlQ2hhbmdlLmVtaXQoJ3NpbmdsZScpO1xuICAgICAgICAgICAgdGhpcy5fcGFnZVZpZXdNb2RlID0gJ3NpbmdsZSc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbigncHJvZ3Jlc3MnLCAoeDogUHJvZ3Jlc3NCYXJFdmVudCkgPT4ge1xuICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4gdGhpcy5wcm9ncmVzcy5lbWl0KHgpKTtcbiAgICB9KTtcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbignZmluZGJhcmNsb3NlJywgKCkgPT4ge1xuICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmRiYXJWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmluZGJhclZpc2libGVDaGFuZ2UuZW1pdChmYWxzZSk7XG4gICAgICAgIHRoaXMuY2RyLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXMub24oJ2ZpbmRiYXJvcGVuJywgKCkgPT4ge1xuICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmRiYXJWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5maW5kYmFyVmlzaWJsZUNoYW5nZS5lbWl0KHRydWUpO1xuICAgICAgICB0aGlzLmNkci5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdwcm9wZXJ0aWVzZGlhbG9nY2xvc2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLnByb3BlcnRpZXNEaWFsb2dWaXNpYmxlID0gZmFsc2U7XG4gICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB0aGlzLnByb3BlcnRpZXNEaWFsb2dWaXNpYmxlQ2hhbmdlLmVtaXQoZmFsc2UpKTtcbiAgICB9KTtcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbigncHJvcGVydGllc2RpYWxvZ29wZW4nLCAoKSA9PiB7XG4gICAgICB0aGlzLnByb3BlcnRpZXNEaWFsb2dWaXNpYmxlID0gdHJ1ZTtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHRoaXMucHJvcGVydGllc0RpYWxvZ1Zpc2libGVDaGFuZ2UuZW1pdCh0cnVlKSk7XG4gICAgfSk7XG5cbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbigncGFnZXNsb2FkZWQnLCAoeDogUGFnZXNMb2FkZWRFdmVudCkgPT4ge1xuICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4gdGhpcy5wYWdlc0xvYWRlZC5lbWl0KHgpKTtcbiAgICAgIHRoaXMuZHluYW1pY0NTU0NvbXBvbmVudC5yZW1vdmVTY3JvbGxiYXJJbkluZmluaXRlU2Nyb2xsTW9kZShmYWxzZSwgdGhpcy5wYWdlVmlld01vZGUsIHRoaXMucHJpbWFyeU1lbnVWaXNpYmxlLCB0aGlzLCB0aGlzLmxvZ0xldmVsKTtcbiAgICAgIGlmICh0aGlzLnJvdGF0aW9uICE9PSB1bmRlZmluZWQgJiYgdGhpcy5yb3RhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCByID0gTnVtYmVyKHRoaXMucm90YXRpb24pO1xuICAgICAgICBpZiAociA9PT0gMCB8fCByID09PSA5MCB8fCByID09PSAxODAgfHwgciA9PT0gMjcwKSB7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLnBhZ2VzUm90YXRpb24gPSByO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2Uuc2h1dHRpbmdEb3duKSB7XG4gICAgICAgICAgLy8gaHVycmllZCB1c2VycyBzb21ldGltZXMgcmVsb2FkIHRoZSBQREYgYmVmb3JlIGl0IGhhcyBmaW5pc2hlZCBpbml0aWFsaXppbmdcbiAgICAgICAgICBpZiAodGhpcy5uYW1lZGRlc3QpIHtcbiAgICAgICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZkxpbmtTZXJ2aWNlLmdvVG9EZXN0aW5hdGlvbih0aGlzLm5hbWVkZGVzdCk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBhZ2UpIHtcbiAgICAgICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnBhZ2UgPSBOdW1iZXIodGhpcy5wYWdlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGFnZUxhYmVsKSB7XG4gICAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIuY3VycmVudFBhZ2VMYWJlbCA9IHRoaXMucGFnZUxhYmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLnNldFpvb20oKTtcbiAgICB9KTtcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbigncGFnZXJlbmRlcmVkJywgKHg6IFBhZ2VSZW5kZXJlZEV2ZW50KSA9PiB7XG4gICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgIHRoaXMucGFnZVJlbmRlcmVkLmVtaXQoeCk7XG4gICAgICAgIHRoaXMuZHluYW1pY0NTU0NvbXBvbmVudC5yZW1vdmVTY3JvbGxiYXJJbkluZmluaXRlU2Nyb2xsTW9kZShmYWxzZSwgdGhpcy5wYWdlVmlld01vZGUsIHRoaXMucHJpbWFyeU1lbnVWaXNpYmxlLCB0aGlzLCB0aGlzLmxvZ0xldmVsKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdwYWdlcmVuZGVyJywgKHg6IFBhZ2VSZW5kZXJFdmVudCkgPT4ge1xuICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICB0aGlzLnBhZ2VSZW5kZXIuZW1pdCh4KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXMub24oJ2Rvd25sb2FkJywgKHg6IFBkZkRvd25sb2FkZWRFdmVudCkgPT4ge1xuICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICB0aGlzLnBkZkRvd25sb2FkZWQuZW1pdCh4KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdzY2FsZWNoYW5naW5nJywgKHg6IFNjYWxlQ2hhbmdpbmdFdmVudCkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuY3VycmVudFpvb21GYWN0b3IuZW1pdCh4LnNjYWxlKTtcbiAgICAgICAgdGhpcy5jZHIubWFya0ZvckNoZWNrKCk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHgucHJlc2V0VmFsdWUgIT09ICdhdXRvJyAmJiB4LnByZXNldFZhbHVlICE9PSAncGFnZS1maXQnICYmIHgucHJlc2V0VmFsdWUgIT09ICdwYWdlLWFjdHVhbCcgJiYgeC5wcmVzZXRWYWx1ZSAhPT0gJ3BhZ2Utd2lkdGgnKSB7XG4gICAgICAgIC8vIGlnbm9yZSByb3VuZGluZyBkaWZmZXJlbmNlc1xuICAgICAgICBpZiAoTWF0aC5hYnMoeC5wcmV2aW91c1NjYWxlIC0geC5zY2FsZSkgPiAwLjAwMDAwMSkge1xuICAgICAgICAgIHRoaXMuem9vbSA9IHguc2NhbGUgKiAxMDA7XG4gICAgICAgICAgdGhpcy56b29tQ2hhbmdlLmVtaXQoeC5zY2FsZSAqIDEwMCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoeC5wcmV2aW91c1ByZXNldFZhbHVlICE9PSB4LnByZXNldFZhbHVlKSB7XG4gICAgICAgIC8vIGNhbGxlZCB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgb25lIG9mIHRoZSB0ZXh0IHZhbHVlcyBvZiB0aGUgem9vbSBzZWxlY3QgZHJvcGRvd25cbiAgICAgICAgdGhpcy56b29tQ2hhbmdlLmVtaXQoeC5wcmVzZXRWYWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbigncm90YXRpb25jaGFuZ2luZycsICh4OiBQYWdlc1JvdGF0aW9uRXZlbnQpID0+IHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbkNoYW5nZS5lbWl0KHgucGFnZXNSb3RhdGlvbik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbignZmlsZWlucHV0Y2hhbmdlJywgKHg6IEZpbGVJbnB1dENoYW5nZWQpID0+IHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgaWYgKHguZmlsZUlucHV0LmZpbGVzICYmIHguZmlsZUlucHV0LmZpbGVzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgLy8gZHJhZyBhbmQgZHJvcFxuICAgICAgICAgIHRoaXMuc3JjQ2hhbmdlVHJpZ2dlcmVkQnlVc2VyID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnNyY0NoYW5nZS5lbWl0KHguZmlsZUlucHV0LmZpbGVzWzBdLm5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHJlZ3VsYXIgZmlsZSBvcGVuIGRpYWxvZ1xuICAgICAgICAgIGNvbnN0IHBhdGggPSB4LmZpbGVJbnB1dD8udmFsdWU/LnJlcGxhY2UoJ0M6XFxcXGZha2VwYXRoXFxcXCcsICcnKTtcbiAgICAgICAgICB0aGlzLnNyY0NoYW5nZS5lbWl0KHBhdGgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbignY3Vyc29ydG9vbGNoYW5nZWQnLCAoeDogSGFuZHRvb2xDaGFuZ2VkKSA9PiB7XG4gICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgIHRoaXMuaGFuZFRvb2wgPSB4LnRvb2wgPT09IFBkZkN1cnNvclRvb2xzLkhBTkQ7XG4gICAgICAgIHRoaXMuaGFuZFRvb2xDaGFuZ2UuZW1pdCh4LnRvb2wgPT09IFBkZkN1cnNvclRvb2xzLkhBTkQpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbignc2lkZWJhcnZpZXdjaGFuZ2VkJywgKHg6IFNpZGViYXJ2aWV3Q2hhbmdlKSA9PiB7XG4gICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgIHRoaXMuc2lkZWJhclZpc2libGVDaGFuZ2UuZW1pdCh4LnZpZXcgPiAwKTtcbiAgICAgICAgaWYgKHgudmlldyA+IDApIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNpZGViYXJWaWV3Q2hhbmdlLmVtaXQoeC52aWV3KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zaWRlYmFyQ29tcG9uZW50KSB7XG4gICAgICAgICAgdGhpcy5zaWRlYmFyQ29tcG9uZW50LnNob3dUb29sYmFyV2hlbk5lY2Vzc2FyeSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdkb2N1bWVudGxvYWRlZCcsIChwZGZMb2FkZWRFdmVudDogUGRmRG9jdW1lbnRMb2FkZWRFdmVudCkgPT4ge1xuICAgICAgcXVldWVNaWNyb3Rhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYWdlcyA9IHBkZkxvYWRlZEV2ZW50LnNvdXJjZS5wYWdlc0NvdW50O1xuICAgICAgICB0aGlzLnBhZ2VMYWJlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMucGFnZSAmJiB0aGlzLnBhZ2UgPj0gcGFnZXMpIHtcbiAgICAgICAgICB0aGlzLnBhZ2UgPSBwYWdlcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNjcm9sbFNpZ25hdHVyZVdhcm5pbmdJbnRvVmlldyhwZGZMb2FkZWRFdmVudC5zb3VyY2UucGRmRG9jdW1lbnQpO1xuICAgICAgICB0aGlzLnBkZkxvYWRlZC5lbWl0KHsgcGFnZXNDb3VudDogcGRmTG9hZGVkRXZlbnQuc291cmNlLnBkZkRvY3VtZW50Py5udW1QYWdlcyB9IGFzIFBkZkxvYWRlZEV2ZW50KTtcbiAgICAgICAgaWYgKHRoaXMuZmluZGJhclZpc2libGUpIHtcbiAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5maW5kQmFyLm9wZW4oKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzRGlhbG9nVmlzaWJsZSkge1xuICAgICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZkRvY3VtZW50UHJvcGVydGllcy5vcGVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oYXNUZXh0TGF5ZXIgPSB0aGlzLnRleHRMYXllciA9PT0gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXMub24oJ3NwcmVhZG1vZGVjaGFuZ2VkJywgKGV2ZW50KSA9PiB7XG4gICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZGVzID0gWydvZmYnLCAnb2RkJywgJ2V2ZW4nXSBhcyBBcnJheTxTcHJlYWRUeXBlPjtcbiAgICAgICAgdGhpcy5zcHJlYWQgPSBtb2Rlc1tldmVudC5tb2RlXTtcbiAgICAgICAgdGhpcy5zcHJlYWRDaGFuZ2UuZW1pdCh0aGlzLnNwcmVhZCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGhpZGVTaWRlYmFyVG9vbGJhciA9ICgpID0+IHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc2lkZWJhckNvbXBvbmVudCkge1xuICAgICAgICAgIHRoaXMuc2lkZWJhckNvbXBvbmVudC5zaG93VG9vbGJhcldoZW5OZWNlc3NhcnkoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdvdXRsaW5lbG9hZGVkJywgaGlkZVNpZGViYXJUb29sYmFyKTtcblxuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdhdHRhY2htZW50c2xvYWRlZCcsIGhpZGVTaWRlYmFyVG9vbGJhcik7XG5cbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbignbGF5ZXJzbG9hZGVkJywgaGlkZVNpZGViYXJUb29sYmFyKTtcblxuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdhbm5vdGF0aW9ubGF5ZXJyZW5kZXJlZCcsIChldmVudDogQW5ub3RhdGlvbkxheWVyUmVuZGVyZWRFdmVudCkgPT4ge1xuICAgICAgY29uc3QgZGl2ID0gZXZlbnQuc291cmNlLmRpdjtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgZXZlbnQuaW5pdGlhbEZvcm1EYXRhU3RvcmVkSW5UaGVQREYgPSB0aGlzLmZvcm1TdXBwb3J0LmluaXRpYWxGb3JtRGF0YVN0b3JlZEluVGhlUERGO1xuICAgICAgICB0aGlzLmFubm90YXRpb25MYXllclJlbmRlcmVkLmVtaXQoZXZlbnQpO1xuICAgICAgICB0aGlzLmVuYWJsZU9yRGlzYWJsZUZvcm1zKGRpdiwgdHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbignYW5ub3RhdGlvbmVkaXRvcmxheWVycmVuZGVyZWQnLCAoZXZlbnQpID0+IHF1ZXVlTWljcm90YXNrKCgpID0+IHRoaXMuYW5ub3RhdGlvbkVkaXRvckxheWVyUmVuZGVyZWQuZW1pdChldmVudCkpKTtcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbigneGZhbGF5ZXJyZW5kZXJlZCcsIChldmVudCkgPT4gcXVldWVNaWNyb3Rhc2soKCkgPT4gdGhpcy54ZmFMYXllclJlbmRlcmVkLmVtaXQoZXZlbnQpKSk7XG4gICAgUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXMub24oJ291dGxpbmVsb2FkZWQnLCAoZXZlbnQpID0+IHF1ZXVlTWljcm90YXNrKCgpID0+IHRoaXMub3V0bGluZUxvYWRlZC5lbWl0KGV2ZW50KSkpO1xuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdhdHRhY2htZW50c2xvYWRlZCcsIChldmVudCkgPT4gcXVldWVNaWNyb3Rhc2soKCkgPT4gdGhpcy5hdHRhY2htZW50c2xvYWRlZC5lbWl0KGV2ZW50KSkpO1xuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzLm9uKCdsYXllcnNsb2FkZWQnLCAoZXZlbnQpID0+IHF1ZXVlTWljcm90YXNrKCgpID0+IHRoaXMubGF5ZXJzbG9hZGVkLmVtaXQoZXZlbnQpKSk7XG4gICAgUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXMub24oJ3ByZXNlbnRhdGlvbm1vZGVjaGFuZ2VkJywgKGV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uID0gdGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uO1xuICAgICAgUERGVmlld2VyQXBwbGljYXRpb24/LnBkZlZpZXdlcj8uZGVzdHJveUJvb2tNb2RlKCk7XG4gICAgfSk7XG5cbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbigndXBkYXRlZmluZGNvbnRyb2xzdGF0ZScsICh4OiBGaW5kUmVzdWx0KSA9PiB7XG4gICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgIGxldCB0eXBlID0gUERGVmlld2VyQXBwbGljYXRpb24uZmluZENvbnRyb2xsZXIuc3RhdGU/LnR5cGUgPz8gJ2ZpbmQnO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ2FnYWluJykge1xuICAgICAgICAgIHR5cGUgPSAnZmluZGFnYWluJztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgY2FzZVNlbnNpdGl2ZTogUERGVmlld2VyQXBwbGljYXRpb24uZmluZENvbnRyb2xsZXIuc3RhdGU/LmNhc2VTZW5zaXRpdmUsXG4gICAgICAgICAgZW50aXJlV29yZDogUERGVmlld2VyQXBwbGljYXRpb24uZmluZENvbnRyb2xsZXIuc3RhdGU/LmVudGlyZVdvcmQsXG4gICAgICAgICAgZmluZFByZXZpb3VzOiBQREZWaWV3ZXJBcHBsaWNhdGlvbi5maW5kQ29udHJvbGxlci5zdGF0ZT8uZmluZFByZXZpb3VzLFxuICAgICAgICAgIGhpZ2hsaWdodEFsbDogUERGVmlld2VyQXBwbGljYXRpb24uZmluZENvbnRyb2xsZXIuc3RhdGU/LmhpZ2hsaWdodEFsbCxcbiAgICAgICAgICBtYXRjaERpYWNyaXRpY3M6IFBERlZpZXdlckFwcGxpY2F0aW9uLmZpbmRDb250cm9sbGVyLnN0YXRlPy5tYXRjaERpYWNyaXRpY3MsXG4gICAgICAgICAgcXVlcnk6IFBERlZpZXdlckFwcGxpY2F0aW9uLmZpbmRDb250cm9sbGVyLnN0YXRlPy5xdWVyeSxcbiAgICAgICAgICB0eXBlLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnVwZGF0ZUZpbmRNYXRjaGVzQ291bnQuZW1pdCh7XG4gICAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICAgIGN1cnJlbnQ6IHgubWF0Y2hlc0NvdW50LmN1cnJlbnQsXG4gICAgICAgICAgdG90YWw6IHgubWF0Y2hlc0NvdW50LnRvdGFsLFxuICAgICAgICAgIG1hdGNoZXM6IFBERlZpZXdlckFwcGxpY2F0aW9uLmZpbmRDb250cm9sbGVyLl9wYWdlTWF0Y2hlcyA/PyBbXSxcbiAgICAgICAgICBtYXRjaGVzTGVuZ3RoOiBQREZWaWV3ZXJBcHBsaWNhdGlvbi5maW5kQ29udHJvbGxlci5fcGFnZU1hdGNoZXNMZW5ndGggPz8gW10sXG4gICAgICAgIH0gYXMgRmluZFJlc3VsdE1hdGNoZXNDb3VudCk7IC8vIFRPRE86IHJlbW92ZSB0aGUgY2FzdCBiZWNhdXNlIGl0J3MganVzdCBkdWN0IHRhcGVcblxuICAgICAgICBpZiAodGhpcy51cGRhdGVGaW5kU3RhdGUpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUZpbmRTdGF0ZS5lbWl0KHguc3RhdGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5vbigndXBkYXRlZmluZG1hdGNoZXNjb3VudCcsICh4OiBGaW5kUmVzdWx0KSA9PiB7XG4gICAgICB4Lm1hdGNoZXNDb3VudC5tYXRjaGVzID0gUERGVmlld2VyQXBwbGljYXRpb24uZmluZENvbnRyb2xsZXIuX3BhZ2VNYXRjaGVzID8/IFtdO1xuICAgICAgeC5tYXRjaGVzQ291bnQubWF0Y2hlc0xlbmd0aCA9IFBERlZpZXdlckFwcGxpY2F0aW9uLmZpbmRDb250cm9sbGVyLl9wYWdlTWF0Y2hlc0xlbmd0aCA/PyBbXTtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+XG4gICAgICAgIHRoaXMudXBkYXRlRmluZE1hdGNoZXNDb3VudC5lbWl0KHtcbiAgICAgICAgICBjYXNlU2Vuc2l0aXZlOiBQREZWaWV3ZXJBcHBsaWNhdGlvbi5maW5kQ29udHJvbGxlci5zdGF0ZT8uY2FzZVNlbnNpdGl2ZSA/PyBmYWxzZSxcbiAgICAgICAgICBlbnRpcmVXb3JkOiBQREZWaWV3ZXJBcHBsaWNhdGlvbi5maW5kQ29udHJvbGxlci5zdGF0ZT8uZW50aXJlV29yZCA/PyBmYWxzZSxcbiAgICAgICAgICBmaW5kUHJldmlvdXM6IFBERlZpZXdlckFwcGxpY2F0aW9uLmZpbmRDb250cm9sbGVyLnN0YXRlPy5maW5kUHJldmlvdXMgPz8gZmFsc2UsXG4gICAgICAgICAgaGlnaGxpZ2h0QWxsOiBQREZWaWV3ZXJBcHBsaWNhdGlvbi5maW5kQ29udHJvbGxlci5zdGF0ZT8uaGlnaGxpZ2h0QWxsID8/IGZhbHNlLFxuICAgICAgICAgIG1hdGNoRGlhY3JpdGljczogUERGVmlld2VyQXBwbGljYXRpb24uZmluZENvbnRyb2xsZXIuc3RhdGU/Lm1hdGNoRGlhY3JpdGljcyA/PyBmYWxzZSxcbiAgICAgICAgICBxdWVyeTogUERGVmlld2VyQXBwbGljYXRpb24uZmluZENvbnRyb2xsZXIuc3RhdGU/LnF1ZXJ5ID8/ICcnLFxuICAgICAgICAgIHR5cGU6IFBERlZpZXdlckFwcGxpY2F0aW9uLmZpbmRDb250cm9sbGVyLnN0YXRlPy50eXBlIGFzIGFueSxcbiAgICAgICAgICBjdXJyZW50OiB4Lm1hdGNoZXNDb3VudC5jdXJyZW50LFxuICAgICAgICAgIHRvdGFsOiB4Lm1hdGNoZXNDb3VudC50b3RhbCxcbiAgICAgICAgICBtYXRjaGVzOiB4Lm1hdGNoZXNDb3VudC5tYXRjaGVzLFxuICAgICAgICAgIG1hdGNoZXNMZW5ndGg6IHgubWF0Y2hlc0NvdW50Lm1hdGNoZXNMZW5ndGgsXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXMub24oJ3BhZ2VjaGFuZ2luZycsICh4OiBQYWdlTnVtYmVyQ2hhbmdlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5zaHV0dGluZ0Rvd24pIHtcbiAgICAgICAgLy8gaHVycmllZCB1c2VycyBzb21ldGltZXMgcmVsb2FkIHRoZSBQREYgYmVmb3JlIGl0IGhhcyBmaW5pc2hlZCBpbml0aWFsaXppbmdcbiAgICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLmN1cnJlbnRQYWdlTnVtYmVyO1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRQYWdlTGFiZWwgPSBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIuY3VycmVudFBhZ2VMYWJlbDtcblxuICAgICAgICAgIGlmIChjdXJyZW50UGFnZSAhPT0gdGhpcy5wYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnBhZ2VDaGFuZ2UuZW1pdChjdXJyZW50UGFnZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjdXJyZW50UGFnZUxhYmVsICE9PSB0aGlzLnBhZ2VMYWJlbCkge1xuICAgICAgICAgICAgdGhpcy5wYWdlTGFiZWxDaGFuZ2UuZW1pdChjdXJyZW50UGFnZUxhYmVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIG9wZW5QREYyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IFBERlZpZXdlckFwcGxpY2F0aW9uOiBJUERGVmlld2VyQXBwbGljYXRpb24gPSB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb247XG5cbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5maW5kQmFyPy5jbG9zZSgpO1xuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnNlY29uZGFyeVRvb2xiYXI/LmNsb3NlKCk7XG4gICAgdHJ5IHtcbiAgICAgIC8vIHNvbWV0aW1lcyB0aGUgYW5ub3RhdGlvbiBlZGl0b3IgVUkgaXMgdW5kZWZpbmVkLCBidXQgaXQncyBhIHByaXZhdGUgdmFyaWFibGUsXG4gICAgICAvLyBzbyB3ZSBzaW1wbHkgY2F0Y2ggdGhlIGVycm9yXG4gICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5kaXNwYXRjaCgnc3dpdGNoYW5ub3RhdGlvbmVkaXRvcm1vZGUnLCB7bW9kZTogMH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIGlnbm9yZSB0aGlzIGVycm9yXG4gICAgfVxuXG4gICAgdGhpcy5vdmVycmlkZURlZmF1bHRTZXR0aW5ncygpO1xuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZlZpZXdlci5kZXN0cm95Qm9va01vZGUoKTtcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIuc3RvcFJlbmRlcmluZygpO1xuICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZlRodW1ibmFpbFZpZXdlci5zdG9wUmVuZGVyaW5nKCk7XG5cbiAgICAvLyAjODAyIGNsZWFyIHRoZSBmb3JtIGRhdGE7IG90aGVyd2lzZSB0aGUgXCJkb3dubG9hZFwiIGRpYWxvZ3Mgb3BlbnNcbiAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZEb2N1bWVudD8uYW5ub3RhdGlvblN0b3JhZ2U/LnJlc2V0TW9kaWZpZWQoKTtcblxuICAgIGF3YWl0IFBERlZpZXdlckFwcGxpY2F0aW9uLmNsb3NlKCk7XG4gICAgdGhpcy5mb3JtU3VwcG9ydD8ucmVzZXQoKTtcbiAgICBpZiAodGhpcy5pbml0aWFsQW5ndWxhckZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1TdXBwb3J0LmZvcm1EYXRhID0gdGhpcy5pbml0aWFsQW5ndWxhckZvcm1EYXRhO1xuICAgIH1cbiAgICBpZiAodGhpcy5maWxlbmFtZUZvckRvd25sb2FkKSB7XG4gICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5hcHBDb25maWcuZmlsZW5hbWVGb3JEb3dubG9hZCA9IHRoaXMuZmlsZW5hbWVGb3JEb3dubG9hZDtcbiAgICB9IGVsc2Uge1xuICAgICAgUERGVmlld2VyQXBwbGljYXRpb24uYXBwQ29uZmlnLmZpbGVuYW1lRm9yRG93bmxvYWQgPSB0aGlzLmd1ZXNzRmlsZW5hbWVGcm9tVXJsKHRoaXMuX3NyYyk7XG4gICAgfVxuXG4gICAgbGV0IHdvcmtlclNyYzogc3RyaW5nIHwgKCgpID0+IHN0cmluZykgPSBwZGZEZWZhdWx0T3B0aW9ucy53b3JrZXJTcmM7XG4gICAgaWYgKHR5cGVvZiB3b3JrZXJTcmMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHdvcmtlclNyYyA9IHdvcmtlclNyYygpO1xuICAgIH1cbiAgICBjb25zdCBvcHRpb25zOiBhbnkgPSB7XG4gICAgICBwYXNzd29yZDogdGhpcy5wYXNzd29yZCxcbiAgICAgIHZlcmJvc2l0eTogdGhpcy5sb2dMZXZlbCxcbiAgICAgIHdvcmtlclNyYyxcbiAgICB9O1xuICAgIGlmICh0aGlzLl9zcmM/LlsncmFuZ2UnXSkge1xuICAgICAgb3B0aW9ucy5yYW5nZSA9IHRoaXMuX3NyY1sncmFuZ2UnXTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaHR0cEhlYWRlcnMpIHtcbiAgICAgIG9wdGlvbnMuaHR0cEhlYWRlcnMgPSB0aGlzLmh0dHBIZWFkZXJzO1xuICAgIH1cbiAgICBpZiAodGhpcy5hdXRob3JpemF0aW9uKSB7XG4gICAgICBvcHRpb25zLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5hdXRob3JpemF0aW9uICE9ICdib29sZWFuJykge1xuICAgICAgICBpZiAoIW9wdGlvbnMuaHR0cEhlYWRlcnMpIG9wdGlvbnMuaHR0cEhlYWRlcnMgPSB7fTtcblxuICAgICAgICBvcHRpb25zLmh0dHBIZWFkZXJzLkF1dGhvcml6YXRpb24gPSB0aGlzLmF1dGhvcml6YXRpb247XG4gICAgICB9XG4gICAgfVxuICAgIG9wdGlvbnMuYmFzZUhyZWYgPSB0aGlzLmJhc2VIcmVmO1xuICAgIHRyeSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMuX3NyYyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgb3B0aW9ucy51cmwgPSB0aGlzLl9zcmM7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3NyYyBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICAgIG9wdGlvbnMuZGF0YSA9IHRoaXMuX3NyYztcbiAgICAgICAgaWYgKHRoaXMuX3NyYy5ieXRlTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgLy8gc29tZXRpbWVzIG5nT25Jbml0KCkgY2FsbHMgb3BlblBkZjIgdG9vIGVhcmx5XG4gICAgICAgICAgLy8gc28gbGV0J3MgaWdub3JlIGVtcHR5IGFycmF5c1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9zcmMgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgIG9wdGlvbnMuZGF0YSA9IHRoaXMuX3NyYztcbiAgICAgICAgaWYgKHRoaXMuX3NyYy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAvLyBzb21ldGltZXMgbmdPbkluaXQoKSBjYWxscyBvcGVuUGRmMiB0b28gZWFybHlcbiAgICAgICAgICAvLyBzbyBsZXQncyBpZ25vcmUgZW1wdHkgYXJyYXlzXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvcHRpb25zLnJhbmdlQ2h1bmtTaXplID0gcGRmRGVmYXVsdE9wdGlvbnMucmFuZ2VDaHVua1NpemU7XG4gICAgICBhd2FpdCBQREZWaWV3ZXJBcHBsaWNhdGlvbi5vcGVuKG9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnBkZkxvYWRpbmdGYWlsZWQuZW1pdChlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZWxlY3RDdXJzb3JUb29sKCkge1xuICAgIGNvbnN0IFBERlZpZXdlckFwcGxpY2F0aW9uOiBJUERGVmlld2VyQXBwbGljYXRpb24gPSB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb247XG4gICAgUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXMuZGlzcGF0Y2goJ3N3aXRjaGN1cnNvcnRvb2wnLCB7IHRvb2w6IHRoaXMuaGFuZFRvb2wgPyAxIDogMCB9KTtcbiAgfVxuXG4gIHB1YmxpYyBkb1JlcGxhY2VCcm93c2VyUHJpbnQodXNlQ3VzdG9tUHJpbnRPZlBkZkpTOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHVzZUN1c3RvbVByaW50T2ZQZGZKUykge1xuICAgICAgY29uc3QgUERGVmlld2VyQXBwbGljYXRpb246IElQREZWaWV3ZXJBcHBsaWNhdGlvbiA9IHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcbiAgICAgIGlmIChQREZWaWV3ZXJBcHBsaWNhdGlvbj8ucHJpbnRQZGYpIHtcbiAgICAgICAgd2luZG93LnByaW50ID0gUERGVmlld2VyQXBwbGljYXRpb24ucHJpbnRQZGYuYmluZChQREZWaWV3ZXJBcHBsaWNhdGlvbik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLm9yaWdpbmFsUHJpbnQgJiYgIXRoaXMub3JpZ2luYWxQcmludC50b1N0cmluZygpLmluY2x1ZGVzKCdwcmludFBkZicpKSB7XG4gICAgICB3aW5kb3cucHJpbnQgPSB0aGlzLm9yaWdpbmFsUHJpbnQ7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIG5nT25EZXN0cm95KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuZGVzdHJveUluaXRpYWxpemF0aW9uID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5jaGVja1Jvb3RFbGVtZW50VGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY2hlY2tSb290RWxlbWVudFRpbWVvdXQpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pbml0aWFsaXphdGlvblByb21pc2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdGlhbGl6YXRpb25Qcm9taXNlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubm90aWZpY2F0aW9uU2VydmljZS5vblBERkpTSW5pdFNpZ25hbC5zZXQodW5kZWZpbmVkKTtcbiAgICBpZiAodGhpcy5yZXNpemVPYnNlcnZlcikge1xuICAgICAgdGhpcy5yZXNpemVPYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfVxuICAgIC8vIGRvIG5vdCBydW4gdGhpcyBjb2RlIG9uIHRoZSBzZXJ2ZXJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnN0IHBjID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByaW50Q29udGFpbmVyJyk7XG4gICAgICBpZiAocGMpIHtcbiAgICAgICAgcGMucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gZG8gbm90IHJ1biB0aGlzIGNvZGUgb24gdGhlIHNlcnZlclxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3Qgb3JpZ2luYWxQcmludCA9IHRoaXMub3JpZ2luYWxQcmludDtcbiAgICAgIGlmICh3aW5kb3cgJiYgb3JpZ2luYWxQcmludCAmJiAhb3JpZ2luYWxQcmludC50b1N0cmluZygpLmluY2x1ZGVzKCdwcmludFBkZicpKSB7XG4gICAgICAgIHdpbmRvdy5wcmludCA9IG9yaWdpbmFsUHJpbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgUERGVmlld2VyQXBwbGljYXRpb246IElQREZWaWV3ZXJBcHBsaWNhdGlvbiA9IHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcblxuICAgIGlmIChQREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgaWYgKFBERlZpZXdlckFwcGxpY2F0aW9uLm5neENvbnNvbGUpIHtcbiAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ubmd4Q29uc29sZS5yZXNldCgpO1xuICAgICAgfVxuICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyPy5kZXN0cm95Qm9va01vZGUoKTtcbiAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZlZpZXdlcj8uc3RvcFJlbmRlcmluZygpO1xuICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmVGh1bWJuYWlsVmlld2VyPy5zdG9wUmVuZGVyaW5nKCk7XG4gICAgICBkZWxldGUgUERGVmlld2VyQXBwbGljYXRpb24ubmd4S2V5Ym9hcmRNYW5hZ2VyO1xuICAgICAgZGVsZXRlIFBERlZpZXdlckFwcGxpY2F0aW9uLmNzcFBvbGljeVNlcnZpY2U7XG4gICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cz8ub2ZmKCdhZnRlcnByaW50JywgdGhpcy5hZnRlclByaW50TGlzdGVuZXIpO1xuICAgICAgUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXM/Lm9mZignYmVmb3JlcHJpbnQnLCB0aGlzLmJlZm9yZVByaW50TGlzdGVuZXIpO1xuICAgICAgUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXM/Lm9mZignc291cmNlY2hhbmdlZCcsIHRoaXMucmVwb3J0U291cmNlQ2hhbmdlcy5iaW5kKHRoaXMpKTtcblxuICAgICAgLy8gIzgwMiBjbGVhciB0aGUgZm9ybSBkYXRhOyBvdGhlcndpc2UgdGhlIFwiZG93bmxvYWRcIiBkaWFsb2dzIG9wZW5zXG4gICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZEb2N1bWVudD8uYW5ub3RhdGlvblN0b3JhZ2U/LnJlc2V0TW9kaWZpZWQoKTtcbiAgICAgIHRoaXMuZm9ybVN1cHBvcnQ/LnJlc2V0KCk7XG4gICAgICAodGhpcy5mb3JtU3VwcG9ydCBhcyBhbnkpID0gdW5kZWZpbmVkO1xuICAgICAgKFBERlZpZXdlckFwcGxpY2F0aW9uLm9uRXJyb3IgYXMgYW55KSA9IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgUERGVmlld2VyQXBwbGljYXRpb24uY2xvc2UoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIGp1c3QgaWdub3JlIGl0XG4gICAgICAgIC8vIGZvciBleGFtcGxlLCB0aGUgc2Vjb25kYXJ5IHRvb2xiYXIgbWF5IGhhdmUgbm90IGJlZW4gaW5pdGlhbGl6ZWQgeWV0LCBzb1xuICAgICAgICAvLyB0cnlpbmcgdG8gZGVzdHJveSBpdCByZXN1bHQgaW4gZXJyb3JzXG4gICAgICB9XG4gICAgICBpZiAoUERGVmlld2VyQXBwbGljYXRpb24ucHJpbnRLZXlEb3duTGlzdGVuZXIpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIFBERlZpZXdlckFwcGxpY2F0aW9uLnByaW50S2V5RG93bkxpc3RlbmVyLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHcgPSBnbG9iYWxUaGlzIGFzIGFueTtcbiAgICAgIGRlbGV0ZSB3LmdldEZvcm1WYWx1ZUZyb21Bbmd1bGFyO1xuICAgICAgZGVsZXRlIHcucmVnaXN0ZXJBY3JvZm9ybUFubm90YXRpb25zO1xuICAgICAgZGVsZXRlIHcuZ2V0Rm9ybVZhbHVlO1xuICAgICAgZGVsZXRlIHcuc2V0Rm9ybVZhbHVlO1xuICAgICAgZGVsZXRlIHcuYXNzaWduRm9ybUlkQW5kRmllbGROYW1lO1xuICAgICAgZGVsZXRlIHcucmVnaXN0ZXJBY3JvZm9ybUZpZWxkO1xuICAgICAgZGVsZXRlIHcucmVnaXN0ZXJYRkFGaWVsZDtcbiAgICAgIGRlbGV0ZSB3LmFzc2lnbkZvcm1JZEFuZEZpZWxkTmFtZTtcbiAgICAgIGRlbGV0ZSB3LnVwZGF0ZUFuZ3VsYXJGb3JtVmFsdWU7XG5cbiAgICAgIGNvbnN0IGJ1cyA9IFBERlZpZXdlckFwcGxpY2F0aW9uLmV2ZW50QnVzO1xuICAgICAgaWYgKGJ1cykge1xuICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi51bmJpbmRFdmVudHMoKTtcbiAgICAgICAgYnVzLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnVuYmluZFdpbmRvd0V2ZW50cygpO1xuICAgICAgUERGVmlld2VyQXBwbGljYXRpb24/Ll9jbGVhbnVwKCk7XG4gICAgICAoUERGVmlld2VyQXBwbGljYXRpb24uZXZlbnRCdXMgYXMgYW55KSA9IHVuZGVmaW5lZDtcbiAgICAgIGRlbGV0ZSB3LlBERlZpZXdlckFwcGxpY2F0aW9uO1xuICAgICAgZGVsZXRlIHcuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xuICAgICAgZGVsZXRlIHcuUERGVmlld2VyQXBwbGljYXRpb25Db25zdGFudHM7XG4gICAgICB0aGlzLnNlcnZpY2Uubmd4RXh0ZW5kZWRQZGZWaWV3ZXJJbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gICAgICAvLyBkbyBub3QgcnVuIHRoaXMgY29kZSBvbiB0aGUgc2VydmVyXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5neC1leHRlbmRlZC1wZGYtdmlld2VyLWZpbGUtaW5wdXQnKS5mb3JFYWNoKChlOiBIVE1MSW5wdXRFbGVtZW50KSA9PiB7XG4gICAgICAgICAgZS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpc1ByaW1hcnlNZW51VmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5zaG93VG9vbGJhcikge1xuICAgICAgY29uc3QgdmlzaWJsZSA9XG4gICAgICAgIHRoaXMuc2hvd0Rvd25sb2FkQnV0dG9uIHx8XG4gICAgICAgIHRoaXMuc2hvd0RyYXdFZGl0b3IgfHxcbiAgICAgICAgdGhpcy5zaG93SGlnaGxpZ2h0RWRpdG9yIHx8XG4gICAgICAgIHRoaXMuc2hvd1RleHRFZGl0b3IgfHxcbiAgICAgICAgdGhpcy5zaG93RmluZEJ1dHRvbiB8fFxuICAgICAgICB0aGlzLnNob3dPcGVuRmlsZUJ1dHRvbiB8fFxuICAgICAgICB0aGlzLnNob3dQYWdpbmdCdXR0b25zIHx8XG4gICAgICAgIHRoaXMuc2hvd1ByZXNlbnRhdGlvbk1vZGVCdXR0b24gfHxcbiAgICAgICAgdGhpcy5zaG93UHJpbnRCdXR0b24gfHxcbiAgICAgICAgdGhpcy5zaG93UHJvcGVydGllc0J1dHRvbiB8fFxuICAgICAgICB0aGlzLnNob3dSb3RhdGVDd0J1dHRvbiB8fFxuICAgICAgICB0aGlzLnNob3dSb3RhdGVDY3dCdXR0b24gfHxcbiAgICAgICAgdGhpcy5zaG93SGFuZFRvb2xCdXR0b24gfHxcbiAgICAgICAgdGhpcy5zaG93Qm9va01vZGVCdXR0b24gfHxcbiAgICAgICAgdGhpcy5zaG93U2luZ2xlUGFnZU1vZGVCdXR0b24gfHxcbiAgICAgICAgdGhpcy5zaG93VmVydGljYWxTY3JvbGxCdXR0b24gfHxcbiAgICAgICAgdGhpcy5zaG93SG9yaXpvbnRhbFNjcm9sbEJ1dHRvbiB8fFxuICAgICAgICB0aGlzLnNob3dJbmZpbml0ZVNjcm9sbEJ1dHRvbiB8fFxuICAgICAgICB0aGlzLnNob3dTcHJlYWRCdXR0b24gfHxcbiAgICAgICAgdGhpcy5zaG93U2lkZWJhckJ1dHRvbiB8fFxuICAgICAgICB0aGlzLnNob3dab29tQnV0dG9ucztcblxuICAgICAgaWYgKHZpc2libGUpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm47IC8vIHNlcnZlciBzaWRlIHJlbmRlcmluZ1xuICAgIH1cbiAgICBjb25zdCBQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uID0gdGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uO1xuICAgIGNvbnN0IFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9uczogSVBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucyA9IHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5QREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM7XG5cbiAgICBpZiAodGhpcy5zZXJ2aWNlLm5neEV4dGVuZGVkUGRmVmlld2VySW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICgnc3JjJyBpbiBjaGFuZ2VzIHx8ICdiYXNlNjRTcmMnIGluIGNoYW5nZXMpIHtcbiAgICAgICAgaWYgKHRoaXMuc3JjQ2hhbmdlVHJpZ2dlcmVkQnlVc2VyKSB7XG4gICAgICAgICAgdGhpcy5zcmNDaGFuZ2VUcmlnZ2VyZWRCeVVzZXIgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5wYWdlVmlld01vZGUgPT09ICdib29rJykge1xuICAgICAgICAgICAgY29uc3QgUERGVmlld2VyQXBwbGljYXRpb246IElQREZWaWV3ZXJBcHBsaWNhdGlvbiA9IHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcbiAgICAgICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uPy5wZGZWaWV3ZXI/LmRlc3Ryb3lCb29rTW9kZSgpO1xuICAgICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24/LnBkZlZpZXdlcj8uc3RvcFJlbmRlcmluZygpO1xuICAgICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24/LnBkZlRodW1ibmFpbFZpZXdlcj8uc3RvcFJlbmRlcmluZygpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISF0aGlzLl9zcmMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2Uubmd4RXh0ZW5kZWRQZGZWaWV3ZXJJbmNvbXBsZXRlbHlJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICB0aGlzLm9wZW5QREYoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IGluaXRpYWxpemVkID0gdGhpcy5ub3RpZmljYXRpb25TZXJ2aWNlLm9uUERGSlNJbml0U2lnbmFsKCk7XG4gICAgICAgICAgICAgIGlmIChpbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMub3BlblBERjIoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB0aGUgbGlicmFyeSBsb2FkcyB0aGUgUERGIGZpbGUgbGF0ZXIgZHVyaW5nIHRoZSBpbml0aWFsaXphdGlvblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vICM4MDIgY2xlYXIgdGhlIGZvcm0gZGF0YTsgb3RoZXJ3aXNlIHRoZSBcImRvd25sb2FkXCIgZGlhbG9ncyBvcGVuc1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbG9zZURvY3VtZW50KFBERlZpZXdlckFwcGxpY2F0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICgnZW5hYmxlRHJhZ0FuZERyb3AnIGluIGNoYW5nZXMpIHtcbiAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zLnNldCgnZW5hYmxlRHJhZ0FuZERyb3AnLCB0aGlzLmVuYWJsZURyYWdBbmREcm9wKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCdmaW5kYmFyVmlzaWJsZScgaW4gY2hhbmdlcykge1xuICAgICAgICBpZiAoY2hhbmdlc1snZmluZGJhclZpc2libGUnXS5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5maW5kQmFyLm9wZW4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5maW5kQmFyLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCdwcm9wZXJ0aWVzRGlhbG9nVmlzaWJsZScgaW4gY2hhbmdlcykge1xuICAgICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzRGlhbG9nVmlzaWJsZSkge1xuICAgICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZkRvY3VtZW50UHJvcGVydGllcy5vcGVuKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmRG9jdW1lbnRQcm9wZXJ0aWVzLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCd6b29tJyBpbiBjaGFuZ2VzKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2V0Wm9vbSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJ21heFpvb20nIGluIGNoYW5nZXMpIHtcbiAgICAgICAgaWYgKFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZlZpZXdlcikge1xuICAgICAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZlZpZXdlci5tYXhab29tID0gdGhpcy5tYXhab29tO1xuICAgICAgICB9XG4gICAgICAgIGlmIChQREZWaWV3ZXJBcHBsaWNhdGlvbi50b29sYmFyKSB7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24udG9vbGJhci5tYXhab29tID0gdGhpcy5tYXhab29tO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICgnbWluWm9vbScgaW4gY2hhbmdlcykge1xuICAgICAgICBpZiAoUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyKSB7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLm1pblpvb20gPSB0aGlzLm1pblpvb207XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFBERlZpZXdlckFwcGxpY2F0aW9uLnRvb2xiYXIpIHtcbiAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi50b29sYmFyLm1pblpvb20gPSB0aGlzLm1pblpvb207XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCdoYW5kVG9vbCcgaW4gY2hhbmdlcykge1xuICAgICAgICB0aGlzLnNlbGVjdEN1cnNvclRvb2woKTtcbiAgICAgIH1cbiAgICAgIGlmICgncGFnZScgaW4gY2hhbmdlcykge1xuICAgICAgICBpZiAodGhpcy5wYWdlKSB7XG4gICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiB0cmlwbGUtZXF1YWxzXG4gICAgICAgICAgaWYgKHRoaXMucGFnZSAhPSBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wYWdlKSB7XG4gICAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wYWdlID0gdGhpcy5wYWdlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCdwYWdlTGFiZWwnIGluIGNoYW5nZXMpIHtcbiAgICAgICAgaWYgKHRoaXMucGFnZUxhYmVsKSB7XG4gICAgICAgICAgaWYgKHRoaXMucGFnZUxhYmVsICE9PSBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIuY3VycmVudFBhZ2VMYWJlbCkge1xuICAgICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLmN1cnJlbnRQYWdlTGFiZWwgPSB0aGlzLnBhZ2VMYWJlbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCdyb3RhdGlvbicgaW4gY2hhbmdlcykge1xuICAgICAgICBpZiAodGhpcy5yb3RhdGlvbikge1xuICAgICAgICAgIGNvbnN0IHIgPSBOdW1iZXIodGhpcy5yb3RhdGlvbik7XG4gICAgICAgICAgaWYgKHIgPT09IDAgfHwgciA9PT0gOTAgfHwgciA9PT0gMTgwIHx8IHIgPT09IDI3MCkge1xuICAgICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLnBhZ2VzUm90YXRpb24gPSByO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIucGFnZXNSb3RhdGlvbiA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICgnc2Nyb2xsTW9kZScgaW4gY2hhbmdlcykge1xuICAgICAgICBpZiAodGhpcy5zY3JvbGxNb2RlIHx8IHRoaXMuc2Nyb2xsTW9kZSA9PT0gU2Nyb2xsTW9kZVR5cGUudmVydGljYWwpIHtcbiAgICAgICAgICBpZiAoUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLnNjcm9sbE1vZGUgIT09IE51bWJlcih0aGlzLnNjcm9sbE1vZGUpKSB7XG4gICAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5kaXNwYXRjaCgnc3dpdGNoc2Nyb2xsbW9kZScsIHsgbW9kZTogTnVtYmVyKHRoaXMuc2Nyb2xsTW9kZSkgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoJ2FjdGl2ZVNpZGViYXJWaWV3JyBpbiBjaGFuZ2VzKSB7XG4gICAgICAgIGlmICh0aGlzLnNpZGViYXJWaXNpYmxlKSB7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmU2lkZWJhci5vcGVuKCk7XG4gICAgICAgICAgY29uc3QgdmlldyA9IE51bWJlcih0aGlzLmFjdGl2ZVNpZGViYXJWaWV3KTtcbiAgICAgICAgICBpZiAodmlldyA9PT0gMSB8fCB2aWV3ID09PSAyIHx8IHZpZXcgPT09IDMgfHwgdmlldyA9PT0gNCkge1xuICAgICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmU2lkZWJhci5zd2l0Y2hWaWV3KHZpZXcsIHRydWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbYWN0aXZlU2lkZWJhclZpZXddIG11c3QgYmUgYW4gaW50ZWdlciB2YWx1ZSBiZXR3ZWVuIDEgYW5kIDQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmU2lkZWJhci5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoJ2ZpbGVuYW1lRm9yRG93bmxvYWQnIGluIGNoYW5nZXMpIHtcbiAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24uYXBwQ29uZmlnLmZpbGVuYW1lRm9yRG93bmxvYWQgPSB0aGlzLmZpbGVuYW1lRm9yRG93bmxvYWQ7XG4gICAgICB9XG4gICAgICBpZiAoJ25hbWVkZGVzdCcgaW4gY2hhbmdlcykge1xuICAgICAgICBpZiAodGhpcy5uYW1lZGRlc3QpIHtcbiAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZMaW5rU2VydmljZS5nb1RvRGVzdGluYXRpb24odGhpcy5uYW1lZGRlc3QpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICgnc3ByZWFkJyBpbiBjaGFuZ2VzKSB7XG4gICAgICAgIGlmICh0aGlzLnNwcmVhZCA9PT0gJ2V2ZW4nKSB7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24uc3ByZWFkTW9kZU9uTG9hZCA9IDI7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLnNwcmVhZE1vZGUgPSAyO1xuICAgICAgICAgIHRoaXMub25TcHJlYWRDaGFuZ2UoJ2V2ZW4nKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNwcmVhZCA9PT0gJ29kZCcpIHtcbiAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5zcHJlYWRNb2RlT25Mb2FkID0gMTtcbiAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIuc3ByZWFkTW9kZSA9IDE7XG4gICAgICAgICAgdGhpcy5vblNwcmVhZENoYW5nZSgnb2RkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24uc3ByZWFkTW9kZU9uTG9hZCA9IDA7XG4gICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLnNwcmVhZE1vZGUgPSAwO1xuICAgICAgICAgIHRoaXMub25TcHJlYWRDaGFuZ2UoJ29mZicpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaGlkZVRvb2xiYXJJZkl0SXNFbXB0eSgpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmNhbGNWaWV3ZXJQb3NpdGlvblRvcCgpKTtcbiAgICB9IC8vIGVuZCBvZiBpZiAoTmd4RXh0ZW5kZWRQZGZWaWV3ZXJDb21wb25lbnQubmd4RXh0ZW5kZWRQZGZWaWV3ZXJJbml0aWFsaXplZClcblxuICAgIGlmICgncHJpbnRSZXNvbHV0aW9uJyBpbiBjaGFuZ2VzKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xuICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucy5zZXQoJ3ByaW50UmVzb2x1dGlvbicsIHRoaXMucHJpbnRSZXNvbHV0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCdpZ25vcmVLZXlib2FyZCcgaW4gY2hhbmdlcykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcbiAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3ZlcnJpZGVEZWZhdWx0U2V0dGluZ3MoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCdpZ25vcmVLZXlzJyBpbiBjaGFuZ2VzKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xuICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vdmVycmlkZURlZmF1bHRTZXR0aW5ncygpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoJ2FjY2VwdEtleXMnIGluIGNoYW5nZXMpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM7XG4gICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICB0aGlzLm92ZXJyaWRlRGVmYXVsdFNldHRpbmdzKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgnc2hvd0JvcmRlcnMnIGluIGNoYW5nZXMpIHtcbiAgICAgIGlmICghY2hhbmdlc1snc2hvd0JvcmRlcnMnXS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICB0aGlzLm92ZXJyaWRlRGVmYXVsdFNldHRpbmdzKCk7XG4gICAgICAgICAgY29uc3Qgdmlld2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZpZXdlcicpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgIGlmICh0aGlzLnNob3dCb3JkZXJzKSB7XG4gICAgICAgICAgICB2aWV3ZXIuY2xhc3NMaXN0LnJlbW92ZSgncmVtb3ZlUGFnZUJvcmRlcnMnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld2VyLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZVBhZ2VCb3JkZXJzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFBERlZpZXdlckFwcGxpY2F0aW9uLnBkZlZpZXdlcikge1xuICAgICAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLnJlbW92ZVBhZ2VCb3JkZXJzID0gIXRoaXMuc2hvd0JvcmRlcnM7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHpvb21FdmVudCA9IHtcbiAgICAgICAgICAgIHNvdXJjZTogdmlld2VyLFxuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWJpdHdpc2VcbiAgICAgICAgICAgIHNjYWxlOiAoTnVtYmVyKHRoaXMuem9vbSkgfCAxMDApIC8gMTAwLFxuICAgICAgICAgICAgcHJlc2V0VmFsdWU6IHRoaXMuem9vbSxcbiAgICAgICAgICB9IGFzIFNjYWxlQ2hhbmdpbmdFdmVudDtcbiAgICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5ldmVudEJ1cy5kaXNwYXRjaCgnc2NhbGVjaGFuZ2luZycsIHpvb21FdmVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoJ3Nob3dVbnZlcmlmaWVkU2lnbmF0dXJlcycgaW4gY2hhbmdlcykge1xuICAgICAgaWYgKFBERlZpZXdlckFwcGxpY2F0aW9uPy5wZGZEb2N1bWVudCkge1xuICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZEb2N1bWVudC5fdHJhbnNwb3J0Lm1lc3NhZ2VIYW5kbGVyLnNlbmQoJ3Nob3dVbnZlcmlmaWVkU2lnbmF0dXJlcycsIHRoaXMuc2hvd1VudmVyaWZpZWRTaWduYXR1cmVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoJ2Zvcm1EYXRhJyBpbiBjaGFuZ2VzKSB7XG4gICAgICBpZiAoIWNoYW5nZXNbJ2Zvcm1EYXRhJ10uaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICAgIHRoaXMuZm9ybVN1cHBvcnQudXBkYXRlRm9ybUZpZWxkc0luUGRmQ2FsbGVkQnlOZ09uQ2hhbmdlcyhjaGFuZ2VzWydmb3JtRGF0YSddLnByZXZpb3VzVmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICgnZW5hYmxlUHJpbnQnIGluIGNoYW5nZXMpIHtcbiAgICAgIGlmICghY2hhbmdlc1snZW5hYmxlUHJpbnQnXS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24uZW5hYmxlUHJpbnQgPSB0aGlzLmVuYWJsZVByaW50O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoXG4gICAgICAoJ2N1c3RvbUZpbmRiYXInIGluIGNoYW5nZXMgJiYgIWNoYW5nZXNbJ2N1c3RvbUZpbmRiYXInXS5pc0ZpcnN0Q2hhbmdlKCkpIHx8XG4gICAgICAoJ2N1c3RvbUZpbmRiYXJCdXR0b25zJyBpbiBjaGFuZ2VzICYmICFjaGFuZ2VzWydjdXN0b21GaW5kYmFyQnV0dG9ucyddLmlzRmlyc3RDaGFuZ2UoKSkgfHxcbiAgICAgICgnY3VzdG9tRmluZGJhcklucHV0QXJlYScgaW4gY2hhbmdlcyAmJiAhY2hhbmdlc1snY3VzdG9tRmluZGJhcklucHV0QXJlYSddLmlzRmlyc3RDaGFuZ2UoKSkgfHxcbiAgICAgICgnY3VzdG9tVG9vbGJhcicgaW4gY2hhbmdlcyAmJiAhY2hhbmdlc1snY3VzdG9tVG9vbGJhciddLmlzRmlyc3RDaGFuZ2UoKSlcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLmR1bW15Q29tcG9uZW50cykge1xuICAgICAgICB0aGlzLmR1bW15Q29tcG9uZW50cy5hZGRNaXNzaW5nU3RhbmRhcmRXaWRnZXRzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCdwYWdlVmlld01vZGUnIGluIGNoYW5nZXMgJiYgIWNoYW5nZXNbJ3BhZ2VWaWV3TW9kZSddLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgdGhpcy5wYWdlVmlld01vZGUgPSBjaGFuZ2VzWydwYWdlVmlld01vZGUnXS5jdXJyZW50VmFsdWU7XG4gICAgfVxuICAgIGlmICgncmVwbGFjZUJyb3dzZXJQcmludCcgaW4gY2hhbmdlcyAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5kb1JlcGxhY2VCcm93c2VyUHJpbnQodGhpcy5yZXBsYWNlQnJvd3NlclByaW50KTtcbiAgICB9XG4gICAgaWYgKCdkaXNhYmxlRm9ybXMnIGluIGNoYW5nZXMpIHtcbiAgICAgIHRoaXMuZW5hYmxlT3JEaXNhYmxlRm9ybXModGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIGZhbHNlKTtcbiAgICB9XG4gICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmNhbGNWaWV3ZXJQb3NpdGlvblRvcCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2xvc2VEb2N1bWVudChQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uKSB7XG4gICAgaWYgKHRoaXMucGFnZVZpZXdNb2RlID09PSAnYm9vaycpIHtcbiAgICAgIGNvbnN0IFBERlZpZXdlckFwcGxpY2F0aW9uOiBJUERGVmlld2VyQXBwbGljYXRpb24gPSB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb247XG4gICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbj8ucGRmVmlld2VyPy5kZXN0cm95Qm9va01vZGUoKTtcbiAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uPy5wZGZWaWV3ZXI/LnN0b3BSZW5kZXJpbmcoKTtcbiAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uPy5wZGZUaHVtYm5haWxWaWV3ZXI/LnN0b3BSZW5kZXJpbmcoKTtcbiAgICB9XG4gICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmRG9jdW1lbnQ/LmFubm90YXRpb25TdG9yYWdlPy5yZXNldE1vZGlmaWVkKCk7XG4gICAgdGhpcy5mb3JtU3VwcG9ydD8ucmVzZXQoKTtcblxuICAgIGxldCBpbnB1dEZpZWxkID0gUERGVmlld2VyQXBwbGljYXRpb24uYXBwQ29uZmlnPy5vcGVuRmlsZUlucHV0O1xuICAgIGlmICghaW5wdXRGaWVsZCkge1xuICAgICAgaW5wdXRGaWVsZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmaWxlSW5wdXQnKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIH1cbiAgICBpZiAoaW5wdXRGaWVsZCkge1xuICAgICAgaW5wdXRGaWVsZC52YWx1ZSA9ICcnO1xuICAgIH1cblxuICAgIGF3YWl0IFBERlZpZXdlckFwcGxpY2F0aW9uLmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNldFpvb20oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm47IC8vIHNlcnZlciBzaWRlIHJlbmRlcmluZ1xuICAgIH1cbiAgICAvLyBzb21ldGltZXMgbmdPbkNoYW5nZXMgY2FsbHMgdGhpcyBtZXRob2QgYmVmb3JlIHRoZSBwYWdlIGlzIGluaXRpYWxpemVkLFxuICAgIC8vIHNvIGxldCdzIGNoZWNrIGlmIHRoaXMucm9vdCBpcyBhbHJlYWR5IGRlZmluZWRcbiAgICBpZiAodGhpcy5yb290KSB7XG4gICAgICBjb25zdCBQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uID0gdGhpcy5wZGZTY3JpcHRMb2FkZXJTZXJ2aWNlLlBERlZpZXdlckFwcGxpY2F0aW9uO1xuXG4gICAgICBsZXQgem9vbUFzTnVtYmVyID0gdGhpcy56b29tO1xuICAgICAgaWYgKFN0cmluZyh6b29tQXNOdW1iZXIpLmVuZHNXaXRoKCclJykpIHtcbiAgICAgICAgem9vbUFzTnVtYmVyID0gTnVtYmVyKFN0cmluZyh6b29tQXNOdW1iZXIpLnJlcGxhY2UoJyUnLCAnJykpIC8gMTAwO1xuICAgICAgfSBlbHNlIGlmICghaXNOYU4oTnVtYmVyKHpvb21Bc051bWJlcikpKSB7XG4gICAgICAgIHpvb21Bc051bWJlciA9IE51bWJlcih6b29tQXNOdW1iZXIpIC8gMTAwO1xuICAgICAgfVxuICAgICAgaWYgKCF6b29tQXNOdW1iZXIpIHtcbiAgICAgICAgaWYgKCFQREZWaWV3ZXJBcHBsaWNhdGlvbi5zdG9yZSkge1xuICAgICAgICAgIC8vIEl0J3MgZGlmZmljdWx0IHRvIHByZXZlbnQgY2FsbGluZyB0aGlzIG1ldGhvZCB0byBlYXJseSwgc28gd2UgbmVlZCB0aGlzIGNoZWNrLlxuICAgICAgICAgIC8vIHNldFpvb20oKSBpcyBjYWxsZWQgbGF0ZXIgYWdhaW4sIHdoZW4gdGhlIFBERiBkb2N1bWVudCBoYXMgYmVlbiBsb2FkZWQgYW5kIGl0c1xuICAgICAgICAgIC8vIGZpbmdlcnByaW50IGhhcyBiZWVuIGNhbGN1bGF0ZWQuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgdXNlclNldHRpbmcgPSBhd2FpdCBQREZWaWV3ZXJBcHBsaWNhdGlvbi5zdG9yZS5nZXQoJ3pvb20nKTtcbiAgICAgICAgICBpZiAodXNlclNldHRpbmcpIHtcbiAgICAgICAgICAgIGlmICghaXNOYU4oTnVtYmVyKHVzZXJTZXR0aW5nKSkpIHtcbiAgICAgICAgICAgICAgem9vbUFzTnVtYmVyID0gTnVtYmVyKHVzZXJTZXR0aW5nKSAvIDEwMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHpvb21Bc051bWJlciA9IHVzZXJTZXR0aW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB6b29tQXNOdW1iZXIgPSAnYXV0byc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChQREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgICBjb25zdCBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnM6IElQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMgPSB0aGlzLnBkZlNjcmlwdExvYWRlclNlcnZpY2UuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xuICAgICAgICBQREZWaWV3ZXJBcHBsaWNhdGlvbk9wdGlvbnMuc2V0KCdkZWZhdWx0Wm9vbVZhbHVlJywgem9vbUFzTnVtYmVyKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2NhbGVEcm9wZG93bkZpZWxkID0gKHRoaXMucm9vdC5uYXRpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50KS5xdWVyeVNlbGVjdG9yKCcjc2NhbGVTZWxlY3QnKSBhcyBIVE1MU2VsZWN0RWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgIGlmIChzY2FsZURyb3Bkb3duRmllbGQpIHtcbiAgICAgICAgaWYgKHRoaXMuem9vbSA9PT0gJ2F1dG8nIHx8IHRoaXMuem9vbSA9PT0gJ3BhZ2UtZml0JyB8fCB0aGlzLnpvb20gPT09ICdwYWdlLWFjdHVhbCcgfHwgdGhpcy56b29tID09PSAncGFnZS13aWR0aCcpIHtcbiAgICAgICAgICBzY2FsZURyb3Bkb3duRmllbGQudmFsdWUgPSB0aGlzLnpvb207XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2NhbGVEcm9wZG93bkZpZWxkLnZhbHVlID0gJ2N1c3RvbSc7XG4gICAgICAgICAgaWYgKHNjYWxlRHJvcGRvd25GaWVsZC5vcHRpb25zKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBzY2FsZURyb3Bkb3duRmllbGQub3B0aW9ucyBhcyBhbnkpIHtcbiAgICAgICAgICAgICAgaWYgKG9wdGlvbi52YWx1ZSA9PT0gJ2N1c3RvbScpIHtcbiAgICAgICAgICAgICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBgJHtNYXRoLnJvdW5kKE51bWJlcih6b29tQXNOdW1iZXIpICogMTAwXzAwMCkgLyAxMDAwfSVgO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIpIHtcbiAgICAgICAgUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyLmN1cnJlbnRTY2FsZVZhbHVlID0gem9vbUFzTnVtYmVyID8/ICdhdXRvJztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaW5pdFJlc2l6ZU9ic2VydmVyKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB2aWV3ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlld2VyJyk7XG4gICAgICBpZiAodmlld2VyKSB7XG4gICAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgIHRoaXMub25SZXNpemUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZSh2aWV3ZXIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgY29uc29sZS5sb2coJ1Jlc2l6ZU9ic2VydmVyIGlzIG5vdCBzdXBwb3J0ZWQgYnkgeW91ciBicm93c2VyJyk7XG4gICAgfVxuICB9XG4gIHB1YmxpYyBvblJlc2l6ZSgpOiB2b2lkIHtcbiAgICBjb25zdCBwZGZWaWV3ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdodG1sJyk7XG4gICAgaWYgKHBkZlZpZXdlciAmJiBwZGZWaWV3ZXIubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dGVyQ29udGFpbmVyJyk7XG4gICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgIGlmICh0aGlzLnNlY29uZGFyeVRvb2xiYXJDb21wb25lbnQpIHtcbiAgICAgICAgICB0aGlzLnNlY29uZGFyeVRvb2xiYXJDb21wb25lbnQuY2hlY2tWaXNpYmlsaXR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZHluYW1pY0NTU0NvbXBvbmVudCkge1xuICAgICAgICAgIHRoaXMuZHluYW1pY0NTU0NvbXBvbmVudC51cGRhdGVUb29sYmFyV2lkdGgoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5keW5hbWljQ1NTQ29tcG9uZW50LmNoZWNrSGVpZ2h0KHRoaXMsIHRoaXMubG9nTGV2ZWwpO1xuICAgIH1cbiAgICB0aGlzLmR5bmFtaWNDU1NDb21wb25lbnQucmVtb3ZlU2Nyb2xsYmFySW5JbmZpbml0ZVNjcm9sbE1vZGUoZmFsc2UsIHRoaXMucGFnZVZpZXdNb2RlLCB0aGlzLnByaW1hcnlNZW51VmlzaWJsZSwgdGhpcywgdGhpcy5sb2dMZXZlbCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdjb250ZXh0bWVudScpXG4gIHB1YmxpYyBvbkNvbnRleHRNZW51KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbnRleHRNZW51QWxsb3dlZDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcGFnZUhhc1Zpc2libGVTaWduYXR1cmUocGFnZTogUERGUGFnZVByb3h5KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgYW5ub3RhdGlvbnMgPSBhd2FpdCBwYWdlLmdldEFubm90YXRpb25zKCk7XG4gICAgY29uc3Qgc2lnbmF0dXJlID0gYW5ub3RhdGlvbnMuZmluZCgoYSkgPT4gYS5maWVsZFR5cGUgPT09ICdTaWcnKTtcbiAgICBpZiAoc2lnbmF0dXJlKSB7XG4gICAgICBjb25zdCByZWN0ID0gc2lnbmF0dXJlPy5yZWN0O1xuICAgICAgaWYgKHJlY3QgJiYgcmVjdC5sZW5ndGggPT09IDQgJiYgcmVjdFsyXSAtIHJlY3RbMF0gPiAwICYmIHJlY3RbM10gLSByZWN0WzFdID4gMCAmJiAhc2lnbmF0dXJlLmhpZGRlbikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHNjcm9sbFNpZ25hdHVyZVdhcm5pbmdJbnRvVmlldyhwZGY6IFBERkRvY3VtZW50UHJveHkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvKiogVGhpcyBtZXRob2QgaGFzIGJlZW4gaW5zcGlyZWQgYnkgaHR0cHM6Ly9tZWRpdW0uY29tL2ZhY3RvcnktbWluZC9hbmd1bGFyLXBkZi1mb3Jtcy1mYTcyYjE1YzNmYmQuIFRoYW5rcywgSm9ubnkgRm94ISAqL1xuICAgIHRoaXMuaGFzU2lnbmF0dXJlID0gZmFsc2U7XG5cbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBwZGY/Lm51bVBhZ2VzOyBpKyspIHtcbiAgICAgIC8vIHRyYWNrIHRoZSBjdXJyZW50IHBhZ2VcbiAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBwZGYuZ2V0UGFnZShpKTtcblxuICAgICAgaWYgKGF3YWl0IHRoaXMucGFnZUhhc1Zpc2libGVTaWduYXR1cmUocGFnZSkpIHtcbiAgICAgICAgdGhpcy5oYXNTaWduYXR1cmUgPSB0cnVlO1xuICAgICAgICBicmVhazsgLy8gc3RvcCBsb29waW5nIHRocm91Z2ggdGhlIHBhZ2VzIGFzIHNvb24gYXMgd2UgZmluZCBhIHNpZ25hdHVyZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5oYXNTaWduYXR1cmUpIHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgLy8gRGVmZXIgc2Nyb2xsaW5nIHRvIGVuc3VyZSBpdCBoYXBwZW5zIGFmdGVyIGFueSBvdGhlciBVSSB1cGRhdGVzXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHZpZXdlckNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2aWV3ZXJDb250YWluZXInKTtcbiAgICAgICAgICB2aWV3ZXJDb250YWluZXI/LnNjcm9sbEJ5KDAsIC0zMik7IC8vIEFkanVzdCB0aGUgc2Nyb2xsIHBvc2l0aW9uXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHpvb21Ub1BhZ2VXaWR0aChldmVudDogTW91c2VFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmhhbmRUb29sKSB7XG4gICAgICBpZiAoIXBkZkRlZmF1bHRPcHRpb25zLmRvdWJsZVRhcFpvb21zSW5IYW5kTW9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcGRmRGVmYXVsdE9wdGlvbnMuZG91YmxlVGFwWm9vbXNJblRleHRTZWxlY3Rpb25Nb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnBhZ2VWaWV3TW9kZSA9PT0gJ2Jvb2snKSB7XG4gICAgICAvLyBzY2FsaW5nIGRvZXNuJ3Qgd29yayBpbiBib29rIG1vZGVcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgUERGVmlld2VyQXBwbGljYXRpb246IElQREZWaWV3ZXJBcHBsaWNhdGlvbiA9IHRoaXMucGRmU2NyaXB0TG9hZGVyU2VydmljZS5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcbiAgICBjb25zdCBkZXNpcmVkQ2VudGVyWSA9IGV2ZW50LmNsaWVudFk7XG4gICAgY29uc3QgcHJldmlvdXNTY2FsZSA9IChQREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIgYXMgYW55KS5jdXJyZW50U2NhbGU7XG5cbiAgICBpZiAodGhpcy56b29tICE9PSBwZGZEZWZhdWx0T3B0aW9ucy5kb3VibGVUYXBab29tRmFjdG9yICYmIHRoaXMuem9vbSArICclJyAhPT0gcGRmRGVmYXVsdE9wdGlvbnMuZG91YmxlVGFwWm9vbUZhY3Rvcikge1xuICAgICAgdGhpcy5wcmV2aW91c1pvb20gPSB0aGlzLnpvb207XG4gICAgICB0aGlzLnpvb20gPSBwZGZEZWZhdWx0T3B0aW9ucy5kb3VibGVUYXBab29tRmFjdG9yOyAvLyBieSBkZWZhdWx0OiAncGFnZS13aWR0aCc7XG4gICAgICBhd2FpdCB0aGlzLnNldFpvb20oKTtcbiAgICB9IGVsc2UgaWYgKHBkZkRlZmF1bHRPcHRpb25zLmRvdWJsZVRhcFJlc2V0c1pvb21PblNlY29uZERvdWJsZVRhcCkge1xuICAgICAgaWYgKHRoaXMucHJldmlvdXNab29tKSB7XG4gICAgICAgIHRoaXMuem9vbSA9IHRoaXMucHJldmlvdXNab29tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy56b29tID0gJ3BhZ2Utd2lkdGgnO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5zZXRab29tKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJyZW50U2NhbGUgPSAoUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyIGFzIGFueSkuY3VycmVudFNjYWxlO1xuICAgIGNvbnN0IHNjYWxlQ29ycmVjdGlvbkZhY3RvciA9IGN1cnJlbnRTY2FsZSAvIHByZXZpb3VzU2NhbGUgLSAxO1xuICAgIGNvbnN0IHJlY3QgPSAoUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyIGFzIGFueSkuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGR5ID0gZGVzaXJlZENlbnRlclkgLSByZWN0LnRvcDtcbiAgICAoUERGVmlld2VyQXBwbGljYXRpb24ucGRmVmlld2VyIGFzIGFueSkuY29udGFpbmVyLnNjcm9sbFRvcCArPSBkeSAqIHNjYWxlQ29ycmVjdGlvbkZhY3RvcjtcbiAgfVxuXG4gIHByaXZhdGUgZW5hYmxlT3JEaXNhYmxlRm9ybXMoZGl2OiBIVE1MRWxlbWVudCwgZG9Ob3RFbmFibGU6IGJvb2xlYW4pIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZUZvcm1zICYmIGRvTm90RW5hYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHhmYUxheWVycyA9IEFycmF5LmZyb20oZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy54ZmFMYXllcicpKTtcbiAgICBjb25zdCBhY3JvRm9ybUxheWVycyA9IEFycmF5LmZyb20oZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hbm5vdGF0aW9uTGF5ZXInKSk7XG4gICAgY29uc3QgbGF5ZXJzID0geGZhTGF5ZXJzLmNvbmNhdCguLi5hY3JvRm9ybUxheWVycyk7XG4gICAgbGF5ZXJzLmZvckVhY2goKGxheWVyKSA9PiBsYXllci5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dCcpLmZvckVhY2goKHgpID0+ICh4LmRpc2FibGVkID0gdGhpcy5kaXNhYmxlRm9ybXMpKSk7XG4gICAgbGF5ZXJzLmZvckVhY2goKGxheWVyKSA9PiBsYXllci5xdWVyeVNlbGVjdG9yQWxsKCdzZWxlY3QnKS5mb3JFYWNoKCh4KSA9PiAoeC5kaXNhYmxlZCA9IHRoaXMuZGlzYWJsZUZvcm1zKSkpO1xuICAgIGxheWVycy5mb3JFYWNoKChsYXllcikgPT4gbGF5ZXIucXVlcnlTZWxlY3RvckFsbCgndGV4dGFyZWEnKS5mb3JFYWNoKCh4KSA9PiAoeC5kaXNhYmxlZCA9IHRoaXMuZGlzYWJsZUZvcm1zKSkpO1xuICB9XG59XG4iLCJAaWYgKHRoZW1lID09PSAnZGFyaycpIHtcbjxwZGYtZGFyay10aGVtZT48L3BkZi1kYXJrLXRoZW1lPlxufVxuQGlmICh0aGVtZSA9PT0gJ2xpZ2h0Jykge1xuPHBkZi1saWdodC10aGVtZT48L3BkZi1saWdodC10aGVtZT5cbn1cbjxwZGYtYWNyb2Zvcm0tZGVmYXVsdC10aGVtZT48L3BkZi1hY3JvZm9ybS1kZWZhdWx0LXRoZW1lPlxuXG48cGRmLWR5bmFtaWMtY3NzICNEeW5hbWljQ3NzQ29tcG9uZW50IFt6b29tXT1cIm1vYmlsZUZyaWVuZGx5Wm9vbVNjYWxlXCI+PC9wZGYtZHluYW1pYy1jc3M+XG48bmctY29udGVudCAqbmdUZW1wbGF0ZU91dGxldD1cImN1c3RvbVBkZlZpZXdlciA/IGN1c3RvbVBkZlZpZXdlciA6IGRlZmF1bHRQZGZWaWV3ZXJcIj48L25nLWNvbnRlbnQ+XG5cbjxuZy10ZW1wbGF0ZSAjZGVmYXVsdFBkZlZpZXdlcj5cbiAgPGRpdiBjbGFzcz1cInpvb21cIiBbc3R5bGUuaGVpZ2h0XT1cIm1pbkhlaWdodCA/IG1pbkhlaWdodCA6IGhlaWdodFwiICNyb290PlxuICAgIDxkaXYgY2xhc3M9XCJodG1sXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiYm9keSBwZGYtanMtdmVyc2lvbi17eyBtYWpvck1pbm9yUGRmSnNWZXJzaW9uIH19XCIgW3N0eWxlLmJhY2tncm91bmRDb2xvcl09XCJiYWNrZ3JvdW5kQ29sb3JcIj5cbiAgICAgICAgPGRpdiBpZD1cIm91dGVyQ29udGFpbmVyXCI+XG4gICAgICAgICAgQGlmIChzaG93RnJlZUZsb2F0aW5nQmFyKSB7XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZyZWUtZmxvYXRpbmctYmFyXCI+XG4gICAgICAgICAgICA8bmctY29udGVudCAqbmdUZW1wbGF0ZU91dGxldD1cImN1c3RvbUZyZWVGbG9hdGluZ0JhciA/IGN1c3RvbUZyZWVGbG9hdGluZ0JhciA6IGRlZmF1bHRGcmVlRmxvYXRpbmdCYXJcIj5cbiAgICAgICAgICAgIDwvbmctY29udGVudD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB9XG4gICAgICAgICAgPHBkZi1zaWRlYmFyICNwZGZzaWRlYmFyIFtzaWRlYmFyVmlzaWJsZV09XCJzaWRlYmFyVmlzaWJsZSB8fCBmYWxzZVwiIFtzaG93U2lkZWJhckJ1dHRvbl09XCJzaG93U2lkZWJhckJ1dHRvblwiXG4gICAgICAgICAgICBbY3VzdG9tU2lkZWJhcl09XCJjdXN0b21TaWRlYmFyXCIgW2N1c3RvbVRodW1ibmFpbF09XCJjdXN0b21UaHVtYm5haWxcIlxuICAgICAgICAgICAgKHRodW1ibmFpbERyYXduKT1cInRodW1ibmFpbERyYXduLmVtaXQoJGV2ZW50KVwiIFttb2JpbGVGcmllbmRseVpvb21TY2FsZV09XCJtb2JpbGVGcmllbmRseVpvb21TY2FsZVwiXG4gICAgICAgICAgICBbc2lkZWJhclBvc2l0aW9uVG9wXT1cInNpZGViYXJQb3NpdGlvblRvcFwiPlxuICAgICAgICAgIDwvcGRmLXNpZGViYXI+XG4gICAgICAgICAgPGRpdiBpZD1cIm1haW5Db250YWluZXJcIiBbY2xhc3MudG9vbGJhci1oaWRkZW5dPVwiIXByaW1hcnlNZW51VmlzaWJsZVwiPlxuICAgICAgICAgICAgPHBkZi1kdW1teS1jb21wb25lbnRzPjwvcGRmLWR1bW15LWNvbXBvbmVudHM+XG5cbiAgICAgICAgICAgIDxwZGYtdG9vbGJhciAob25Ub29sYmFyTG9hZGVkKT1cIm9uVG9vbGJhckxvYWRlZCgkZXZlbnQpXCIgW3NpZGViYXJWaXNpYmxlXT1cInNpZGViYXJWaXNpYmxlXCJcbiAgICAgICAgICAgICAgW2NsYXNzLnNlcnZlci1zaWRlLXJlbmRlcmluZ109XCJzZXJ2ZXJTaWRlUmVuZGVyaW5nXCIgW2N1c3RvbVRvb2xiYXJdPVwiY3VzdG9tVG9vbGJhclwiXG4gICAgICAgICAgICAgIFttb2JpbGVGcmllbmRseVpvb21TY2FsZV09XCJtb2JpbGVGcmllbmRseVpvb21TY2FsZVwiIFsocGFnZVZpZXdNb2RlKV09XCJwYWdlVmlld01vZGVcIlxuICAgICAgICAgICAgICBbcHJpbWFyeU1lbnVWaXNpYmxlXT1cInByaW1hcnlNZW51VmlzaWJsZVwiIFtzY3JvbGxNb2RlXT1cInNjcm9sbE1vZGUgPz8gMFwiXG4gICAgICAgICAgICAgIFtzaG93UHJvcGVydGllc0J1dHRvbl09XCJzaG93UHJvcGVydGllc0J1dHRvblwiIFtzaG93Qm9va01vZGVCdXR0b25dPVwic2hvd0Jvb2tNb2RlQnV0dG9uXCJcbiAgICAgICAgICAgICAgW3Nob3dEb3dubG9hZEJ1dHRvbl09XCJzaG93RG93bmxvYWRCdXR0b25cIiBbc2hvd0RyYXdFZGl0b3JdPVwic2hvd0RyYXdFZGl0b3JcIlxuICAgICAgICAgICAgICBbc2hvd0hpZ2hsaWdodEVkaXRvcl09XCJzaG93SGlnaGxpZ2h0RWRpdG9yXCIgW3Nob3dGaW5kQnV0dG9uXT1cInNob3dGaW5kQnV0dG9uXCJcbiAgICAgICAgICAgICAgW3Nob3dIYW5kVG9vbEJ1dHRvbl09XCJzaG93SGFuZFRvb2xCdXR0b25cIiBbaGFuZFRvb2xdPVwiaGFuZFRvb2xcIlxuICAgICAgICAgICAgICBbc2hvd0hvcml6b250YWxTY3JvbGxCdXR0b25dPVwic2hvd0hvcml6b250YWxTY3JvbGxCdXR0b25cIlxuICAgICAgICAgICAgICBbc2hvd0luZmluaXRlU2Nyb2xsQnV0dG9uXT1cInNob3dJbmZpbml0ZVNjcm9sbEJ1dHRvblwiIFtzaG93T3BlbkZpbGVCdXR0b25dPVwic2hvd09wZW5GaWxlQnV0dG9uXCJcbiAgICAgICAgICAgICAgW3Nob3dQYWdpbmdCdXR0b25zXT1cInNob3dQYWdpbmdCdXR0b25zXCIgW3Nob3dGaXJzdEFuZExhc3RQYWdlQnV0dG9uc109XCJzaG93Rmlyc3RBbmRMYXN0UGFnZUJ1dHRvbnNcIlxuICAgICAgICAgICAgICBbc2hvd1ByZXZpb3VzQW5kTmV4dFBhZ2VCdXR0b25zXT1cInNob3dQcmV2aW91c0FuZE5leHRQYWdlQnV0dG9uc1wiIFtzaG93UGFnZU51bWJlcl09XCJzaG93UGFnZU51bWJlclwiXG4gICAgICAgICAgICAgIFtzaG93UGFnZUxhYmVsXT1cInNob3dQYWdlTGFiZWxcIlxuICAgICAgICAgICAgICBbc2hvd1ByZXNlbnRhdGlvbk1vZGVCdXR0b25dPVwic2hvd1ByZXNlbnRhdGlvbk1vZGVCdXR0b24gJiYgcGFnZVZpZXdNb2RlICE9PSAnYm9vaydcIlxuICAgICAgICAgICAgICBbc2hvd1ByaW50QnV0dG9uXT1cImVuYWJsZVByaW50ID8gc2hvd1ByaW50QnV0dG9uIDogZmFsc2VcIiBbc2hvd1JvdGF0ZUN3QnV0dG9uXT1cInNob3dSb3RhdGVDd0J1dHRvblwiXG4gICAgICAgICAgICAgIFtzaG93Um90YXRlQ2N3QnV0dG9uXT1cInNob3dSb3RhdGVDY3dCdXR0b25cIlxuICAgICAgICAgICAgICBbc2hvd1NlY29uZGFyeVRvb2xiYXJCdXR0b25dPVwic2hvd1NlY29uZGFyeVRvb2xiYXJCdXR0b24gJiYgIXNlcnZpY2Uuc2Vjb25kYXJ5TWVudUlzRW1wdHlcIlxuICAgICAgICAgICAgICBbc2hvd1NpZGViYXJCdXR0b25dPVwic2hvd1NpZGViYXJCdXR0b25cIiBbc2hvd1NpbmdsZVBhZ2VNb2RlQnV0dG9uXT1cInNob3dTaW5nbGVQYWdlTW9kZUJ1dHRvblwiXG4gICAgICAgICAgICAgIFtzaG93U3ByZWFkQnV0dG9uXT1cInNob3dTcHJlYWRCdXR0b25cIiBbc2hvd1N0YW1wRWRpdG9yXT1cInNob3dTdGFtcEVkaXRvclwiXG4gICAgICAgICAgICAgIFtzaG93VGV4dEVkaXRvcl09XCJzaG93VGV4dEVkaXRvclwiIFtzaG93VmVydGljYWxTY3JvbGxCdXR0b25dPVwic2hvd1ZlcnRpY2FsU2Nyb2xsQnV0dG9uXCJcbiAgICAgICAgICAgICAgW3Nob3dXcmFwcGVkU2Nyb2xsQnV0dG9uXT1cInNob3dXcmFwcGVkU2Nyb2xsQnV0dG9uXCJcbiAgICAgICAgICAgICAgW3Nob3dab29tQnV0dG9uc109XCJzaG93Wm9vbUJ1dHRvbnMgJiYgcGFnZVZpZXdNb2RlICE9PSAnYm9vaydcIiBbc2hvd1pvb21Ecm9wZG93bl09XCJzaG93Wm9vbURyb3Bkb3duXCJcbiAgICAgICAgICAgICAgW3NwcmVhZF09XCJzcHJlYWRcIiBbdGV4dExheWVyXT1cInRleHRMYXllclwiIFt0b29sYmFyTWFyZ2luVG9wXT1cInRvb2xiYXJNYXJnaW5Ub3BcIlxuICAgICAgICAgICAgICBbdG9vbGJhcldpZHRoXT1cInRvb2xiYXJXaWR0aFwiIFt6b29tTGV2ZWxzXT1cInpvb21MZXZlbHNcIiBbZmluZGJhclZpc2libGVdPVwiZmluZGJhclZpc2libGVcIlxuICAgICAgICAgICAgICBbaGFzVGV4dExheWVyXT1cImhhc1RleHRMYXllclwiPjwvcGRmLXRvb2xiYXI+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3JQYXJhbXNUb29sYmFyIGhpZGRlbiBkb29ySGFuZ2VyUmlnaHRcIiBpZD1cImVkaXRvckhpZ2hsaWdodFBhcmFtc1Rvb2xiYXJcIj5cbiAgICAgICAgICAgICAgPGRpdiBpZD1cImhpZ2hsaWdodFBhcmFtc1Rvb2xiYXJDb250YWluZXJcIiBjbGFzcz1cImVkaXRvclBhcmFtc1Rvb2xiYXJDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiZWRpdG9ySGlnaGxpZ2h0Q29sb3JQaWNrZXJcIiBjbGFzcz1cImNvbG9yUGlja2VyXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cImhpZ2hsaWdodENvbG9yUGlja2VyTGFiZWxcIiBjbGFzcz1cImVkaXRvclBhcmFtc0xhYmVsXCJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1sMTBuLWlkPVwicGRmanMtZWRpdG9yLWhpZ2hsaWdodC1jb2xvcnBpY2tlci1sYWJlbFwiPkhpZ2hsaWdodCBjb2xvcjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiZWRpdG9ySGlnaGxpZ2h0VGhpY2tuZXNzXCI+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZWRpdG9yRnJlZUhpZ2hsaWdodFRoaWNrbmVzc1wiIGNsYXNzPVwiZWRpdG9yUGFyYW1zTGFiZWxcIlxuICAgICAgICAgICAgICAgICAgICBkYXRhLWwxMG4taWQ9XCJwZGZqcy1lZGl0b3ItZnJlZS1oaWdobGlnaHQtdGhpY2tuZXNzLWlucHV0XCI+VGhpY2tuZXNzPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aGlja25lc3NQaWNrZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIGlkPVwiZWRpdG9yRnJlZUhpZ2hsaWdodFRoaWNrbmVzc1wiIGNsYXNzPVwiZWRpdG9yUGFyYW1zU2xpZGVyXCJcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhLWwxMG4taWQ9XCJwZGZqcy1lZGl0b3ItZnJlZS1oaWdobGlnaHQtdGhpY2tuZXNzLXRpdGxlXCIgdmFsdWU9XCIxMlwiIG1pbj1cIjhcIiBtYXg9XCIyNFwiIHN0ZXA9XCIxXCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJlZGl0b3JIaWdobGlnaHRWaXNpYmlsaXR5XCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRvZ2dsZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImVkaXRvckhpZ2hsaWdodFNob3dBbGxcIiBjbGFzcz1cImVkaXRvclBhcmFtc0xhYmVsXCJcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhLWwxMG4taWQ9XCJwZGZqcy1lZGl0b3ItaGlnaGxpZ2h0LXNob3ctYWxsLWJ1dHRvbi1sYWJlbFwiPlNob3cgYWxsPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImVkaXRvckhpZ2hsaWdodFNob3dBbGxcIiBjbGFzcz1cInRvZ2dsZS1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgIGRhdGEtbDEwbi1pZD1cInBkZmpzLWVkaXRvci1oaWdobGlnaHQtc2hvdy1hbGwtYnV0dG9uXCIgYXJpYS1wcmVzc2VkPVwidHJ1ZVwiPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3JQYXJhbXNUb29sYmFyIGhpZGRlbiBkb29ySGFuZ2VyUmlnaHRcIiBpZD1cImVkaXRvckZyZWVUZXh0UGFyYW1zVG9vbGJhclwiXG4gICAgICAgICAgICAgIFtjbGFzcy5zZXJ2ZXItc2lkZS1yZW5kZXJpbmddPVwic2VydmVyU2lkZVJlbmRlcmluZ1wiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yUGFyYW1zVG9vbGJhckNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3JQYXJhbXNTZXR0ZXJcIj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJlZGl0b3JGcmVlVGV4dENvbG9yXCIgY2xhc3M9XCJlZGl0b3JQYXJhbXNMYWJlbFwiXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtbDEwbi1pZD1cInBkZmpzLWVkaXRvci1mcmVlLXRleHQtY29sb3ItaW5wdXRcIj5Gb250IENvbG9yPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY29sb3JcIiBpZD1cImVkaXRvckZyZWVUZXh0Q29sb3JcIiBjbGFzcz1cImVkaXRvclBhcmFtc0NvbG9yXCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yUGFyYW1zU2V0dGVyXCI+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZWRpdG9yRnJlZVRleHRGb250U2l6ZVwiIGNsYXNzPVwiZWRpdG9yUGFyYW1zTGFiZWxcIlxuICAgICAgICAgICAgICAgICAgICBkYXRhLWwxMG4taWQ9XCJwZGZqcy1lZGl0b3ItZnJlZS10ZXh0LXNpemUtaW5wdXRcIj5Gb250IFNpemU8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIGlkPVwiZWRpdG9yRnJlZVRleHRGb250U2l6ZVwiIGNsYXNzPVwiZWRpdG9yUGFyYW1zU2xpZGVyXCIgdmFsdWU9XCIxMFwiIG1pbj1cIjVcIlxuICAgICAgICAgICAgICAgICAgICBtYXg9XCIxMDBcIiBzdGVwPVwiMVwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3JQYXJhbXNUb29sYmFyIGhpZGRlbiBkb29ySGFuZ2VyUmlnaHRcIiBpZD1cImVkaXRvclN0YW1wUGFyYW1zVG9vbGJhclwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yUGFyYW1zVG9vbGJhckNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJlZGl0b3JTdGFtcEFkZEltYWdlXCIgY2xhc3M9XCJzZWNvbmRhcnlUb29sYmFyQnV0dG9uXCIgdGl0bGU9XCJBZGQgaW1hZ2VcIlxuICAgICAgICAgICAgICAgICAgZGF0YS1sMTBuLWlkPVwicGRmanMtZWRpdG9yLXN0YW1wLWFkZC1pbWFnZS1idXR0b25cIiBhcmlhLWxhYmVsPVwiQWRkIGltYWdlXCI+XG4gICAgICAgICAgICAgICAgICA8c3ZnIHJvbGU9XCJpbWdcIiBhcmlhLWxhYmVsPVwiQWRkIGltYWdlXCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgICAgICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGNsYXNzPVwiYWxpZ24taW1hZ2UtdG8tdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICAgICAgICAgIGQ9XCJNNy4wMDQ4OCA5Ljc1VjE0QzcuMDA0ODggMTQuMTY1OCA3LjA3MDczIDE0LjMyNDcgNy4xODc5NCAxNC40NDE5QzcuMzA1MTUgMTQuNTU5MiA3LjQ2NDEyIDE0LjYyNSA3LjYyOTg4IDE0LjYyNUM3Ljc5NTY0IDE0LjYyNSA3Ljk1NDYxIDE0LjU1OTIgOC4wNzE4MyAxNC40NDE5QzguMTg5MDQgMTQuMzI0NyA4LjI1NDg4IDE0LjE2NTggOC4yNTQ4OCAxNFY5Ljc1TDguNzU0ODggOS4yNUgxMy4wMDQ5QzEzLjE3MDYgOS4yNSAxMy4zMjk2IDkuMTg0MTUgMTMuNDQ2OCA5LjA2Njk0QzEzLjU2NCA4Ljk0OTczIDEzLjYyOTkgOC43OTA3NiAxMy42Mjk5IDguNjI1QzEzLjYyOTkgOC40NTkyNCAxMy41NjQgOC4zMDAyNyAxMy40NDY4IDguMTgzMDZDMTMuMzI5NiA4LjA2NTg1IDEzLjE3MDYgOCAxMy4wMDQ5IDhIOC43NTQ4OEw4LjI1NDg4IDcuNVYzLjI1QzguMjU0ODggMy4wODQyNCA4LjE4OTA0IDIuOTI1MjcgOC4wNzE4MyAyLjgwODA2QzcuOTU0NjEgMi42OTA4NSA3Ljc5NTY0IDIuNjI1IDcuNjI5ODggMi42MjVDNy40NjQxMiAyLjYyNSA3LjMwNTE1IDIuNjkwODUgNy4xODc5NCAyLjgwODA2QzcuMDcwNzMgMi45MjUyNyA3LjAwNDg4IDMuMDg0MjQgNy4wMDQ4OCAzLjI1VjcuNUw2LjUwNDg4IDhIMi4yNTQ4OEMyLjA4OTEyIDggMS45MzAxNSA4LjA2NTg1IDEuODEyOTQgOC4xODMwNkMxLjY5NTczIDguMzAwMjcgMS42Mjk4OCA4LjQ1OTI0IDEuNjI5ODggOC42MjVDMS42Mjk4OCA4Ljc5MDc2IDEuNjk1NzMgOC45NDk3MyAxLjgxMjk0IDkuMDY2OTRDMS45MzAxNSA5LjE4NDE1IDIuMDg5MTIgOS4yNSAyLjI1NDg4IDkuMjVINi4zOTE4OEw3LjAwNDg4IDkuNzVaXCJcbiAgICAgICAgICAgICAgICAgICAgICBmaWxsPVwiYmxhY2tcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBkYXRhLWwxMG4taWQ9XCJwZGZqcy1lZGl0b3Itc3RhbXAtYWRkLWltYWdlLWJ1dHRvbi1sYWJlbFwiPkFkZCBpbWFnZTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImVkaXRvclBhcmFtc1Rvb2xiYXIgaGlkZGVuIGRvb3JIYW5nZXJSaWdodFwiIGlkPVwiZWRpdG9ySW5rUGFyYW1zVG9vbGJhclwiXG4gICAgICAgICAgICAgIFtjbGFzcy5zZXJ2ZXItc2lkZS1yZW5kZXJpbmddPVwic2VydmVyU2lkZVJlbmRlcmluZ1wiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yUGFyYW1zVG9vbGJhckNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3JQYXJhbXNTZXR0ZXJcIj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJlZGl0b3JJbmtDb2xvclwiIGNsYXNzPVwiZWRpdG9yUGFyYW1zTGFiZWxcIlxuICAgICAgICAgICAgICAgICAgICBkYXRhLWwxMG4taWQ9XCJwZGZqcy1lZGl0b3ItaW5rLWNvbG9yLWlucHV0XCI+Q29sb3I8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjb2xvclwiIGlkPVwiZWRpdG9ySW5rQ29sb3JcIiBjbGFzcz1cImVkaXRvclBhcmFtc0NvbG9yXCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdG9yUGFyYW1zU2V0dGVyXCI+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZWRpdG9ySW5rVGhpY2tuZXNzXCIgY2xhc3M9XCJlZGl0b3JQYXJhbXNMYWJlbFwiXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtbDEwbi1pZD1cInBkZmpzLWVkaXRvci1pbmstdGhpY2tuZXNzLWlucHV0XCI+VGhpY2tuZXNzPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFuZ2VcIiBpZD1cImVkaXRvcklua1RoaWNrbmVzc1wiIGNsYXNzPVwiZWRpdG9yUGFyYW1zU2xpZGVyXCIgdmFsdWU9XCIxXCIgbWluPVwiMVwiIG1heD1cIjIwXCJcbiAgICAgICAgICAgICAgICAgICAgc3RlcD1cIjFcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0b3JQYXJhbXNTZXR0ZXJcIj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJlZGl0b3JJbmtPcGFjaXR5XCIgY2xhc3M9XCJlZGl0b3JQYXJhbXNMYWJlbFwiXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtbDEwbi1pZD1cInBkZmpzLWVkaXRvci1pbmstb3BhY2l0eS1pbnB1dFwiPk9wYWNpdHk8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgQGlmKHBkZkpzVmVyc2lvbi5zdGFydHNXaXRoKCc0LjcnKSkge1xuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIGlkPVwiZWRpdG9ySW5rT3BhY2l0eVwiIGNsYXNzPVwiZWRpdG9yUGFyYW1zU2xpZGVyXCIgdmFsdWU9XCIxMDBcIiBtaW49XCIxXCIgbWF4PVwiMTAwXCJcbiAgICAgICAgICAgICAgICAgICAgc3RlcD1cIjFcIiAvPlxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgQGVsc2Uge1xuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIGlkPVwiZWRpdG9ySW5rT3BhY2l0eVwiIGNsYXNzPVwiZWRpdG9yUGFyYW1zU2xpZGVyXCIgdmFsdWU9XCIxXCIgbWluPVwiMC4wNVwiIG1heD1cIjFcIlxuICAgICAgICAgICAgICAgICAgICBzdGVwPVwiMC4wNVwiIC8+XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxwZGYtc2Vjb25kYXJ5LXRvb2xiYXIgI3BkZlNlY29uZGFyeVRvb2xiYXJDb21wb25lbnQgW2NsYXNzLnNlcnZlci1zaWRlLXJlbmRlcmluZ109XCJzZXJ2ZXJTaWRlUmVuZGVyaW5nXCJcbiAgICAgICAgICAgICAgW2N1c3RvbVNlY29uZGFyeVRvb2xiYXJdPVwiY3VzdG9tU2Vjb25kYXJ5VG9vbGJhclwiIFtzZWNvbmRhcnlUb29sYmFyVG9wXT1cInNlY29uZGFyeVRvb2xiYXJUb3BcIlxuICAgICAgICAgICAgICBbbW9iaWxlRnJpZW5kbHlab29tU2NhbGVdPVwibW9iaWxlRnJpZW5kbHlab29tU2NhbGVcIiAoc3ByZWFkQ2hhbmdlKT1cIm9uU3ByZWFkQ2hhbmdlKCRldmVudClcIlxuICAgICAgICAgICAgICBbbG9jYWxpemF0aW9uSW5pdGlhbGl6ZWRdPVwibG9jYWxpemF0aW9uSW5pdGlhbGl6ZWRcIj5cbiAgICAgICAgICAgIDwvcGRmLXNlY29uZGFyeS10b29sYmFyPlxuXG4gICAgICAgICAgICA8cGRmLWZpbmRiYXIgW2NsYXNzLnNlcnZlci1zaWRlLXJlbmRlcmluZ109XCJzZXJ2ZXJTaWRlUmVuZGVyaW5nXCIgW2ZpbmRiYXJMZWZ0XT1cImZpbmRiYXJMZWZ0XCJcbiAgICAgICAgICAgICAgW2ZpbmRiYXJUb3BdPVwiZmluZGJhclRvcFwiIFttb2JpbGVGcmllbmRseVpvb21TY2FsZV09XCJtb2JpbGVGcmllbmRseVpvb21TY2FsZVwiXG4gICAgICAgICAgICAgIFtzaG93RmluZEJ1dHRvbl09XCJzaG93RmluZEJ1dHRvbiB8fCBmYWxzZVwiIFtjdXN0b21GaW5kYmFySW5wdXRBcmVhXT1cImN1c3RvbUZpbmRiYXJJbnB1dEFyZWFcIlxuICAgICAgICAgICAgICBbY3VzdG9tRmluZGJhckJ1dHRvbnNdPVwiY3VzdG9tRmluZGJhckJ1dHRvbnNcIiBbc2hvd0ZpbmRFbnRpcmVXb3JkXT1cInNob3dGaW5kRW50aXJlV29yZFwiXG4gICAgICAgICAgICAgIFtzaG93RmluZEhpZ2hsaWdodEFsbF09XCJzaG93RmluZEhpZ2hsaWdodEFsbFwiIFtzaG93RmluZE1hdGNoRGlhY3JpdGljc109XCJzaG93RmluZE1hdGNoRGlhY3JpdGljc1wiXG4gICAgICAgICAgICAgIFtzaG93RmluZE1hdGNoQ2FzZV09XCJzaG93RmluZE1hdGNoQ2FzZVwiIFtzaG93RmluZE11bHRpcGxlXT1cInNob3dGaW5kTXVsdGlwbGVcIlxuICAgICAgICAgICAgICBbc2hvd0ZpbmRSZWdleHBdPVwic2hvd0ZpbmRSZWdleHBcIiBbc2hvd0ZpbmRNZXNzYWdlc109XCJzaG93RmluZE1lc3NhZ2VzXCJcbiAgICAgICAgICAgICAgW3Nob3dGaW5kUmVzdWx0c0NvdW50XT1cInNob3dGaW5kUmVzdWx0c0NvdW50XCI+XG4gICAgICAgICAgICA8L3BkZi1maW5kYmFyPlxuXG4gICAgICAgICAgICA8cGRmLWNvbnRleHQtbWVudT48L3BkZi1jb250ZXh0LW1lbnU+XG5cbiAgICAgICAgICAgIDxkaXYgaWQ9XCJ2aWV3ZXJDb250YWluZXJcIiBbc3R5bGUudG9wXT1cInZpZXdlclBvc2l0aW9uVG9wXCIgW3N0eWxlLmJhY2tncm91bmRDb2xvcl09XCJiYWNrZ3JvdW5kQ29sb3JcIj5cbiAgICAgICAgICAgICAgQGlmIChoYXNTaWduYXR1cmUgJiYgc2hvd1VudmVyaWZpZWRTaWduYXR1cmVzKSB7XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1bnZlcmlmaWVkLXNpZ25hdHVyZS13YXJuaW5nXCI+XG4gICAgICAgICAgICAgICAge3tcbiAgICAgICAgICAgICAgICAndW52ZXJpZmllZC1zaWduYXR1cmUtd2FybmluZydcbiAgICAgICAgICAgICAgICB8IHRyYW5zbGF0ZVxuICAgICAgICAgICAgICAgIDogXCJUaGlzIFBERiBmaWxlIGNvbnRhaW5zIGEgZGlnaXRhbCBzaWduYXR1cmUuIFRoZSBQREYgdmlld2VyIGNhbid0IHZlcmlmeSBpZiB0aGUgc2lnbmF0dXJlIGlzIHZhbGlkLlxuICAgICAgICAgICAgICAgIFBsZWFzZSBkb3dubG9hZCB0aGUgZmlsZSBhbmQgb3BlbiBpdCBpbiBBY3JvYmF0IFJlYWRlciB0byB2ZXJpZnkgdGhlIHNpZ25hdHVyZSBpcyB2YWxpZC5cIlxuICAgICAgICAgICAgICAgIHwgYXN5bmNcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA8ZGl2IGlkPVwidmlld2VyXCIgY2xhc3M9XCJwZGZWaWV3ZXJcIiAoZGJsY2xpY2spPVwiem9vbVRvUGFnZVdpZHRoKCRldmVudClcIj48L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHBkZi1lcnJvci1tZXNzYWdlPjwvcGRmLWVycm9yLW1lc3NhZ2U+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPCEtLSBtYWluQ29udGFpbmVyIC0tPlxuXG4gICAgICAgICAgPGRpdiBpZD1cImRpYWxvZ0NvbnRhaW5lclwiPlxuICAgICAgICAgICAgPHBkZi1wYXNzd29yZC1kaWFsb2c+PC9wZGYtcGFzc3dvcmQtZGlhbG9nPlxuICAgICAgICAgICAgPHBkZi1kb2N1bWVudC1wcm9wZXJ0aWVzLWRpYWxvZz48L3BkZi1kb2N1bWVudC1wcm9wZXJ0aWVzLWRpYWxvZz5cbiAgICAgICAgICAgIDxwZGYtYWx0LXRleHQtZGlhbG9nPjwvcGRmLWFsdC10ZXh0LWRpYWxvZz5cbiAgICAgICAgICAgIDxwZGYtYWx0LXRleHQtc2V0dGluZ3MtZGlhbG9nPjwvcGRmLWFsdC10ZXh0LXNldHRpbmdzLWRpYWxvZz5cbiAgICAgICAgICAgIDxwZGYtcHJlcGFyZS1wcmludGluZy1kaWFsb2c+PC9wZGYtcHJlcGFyZS1wcmludGluZy1kaWFsb2c+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPCEtLSBkaWFsb2dDb250YWluZXIgLS0+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBAaWYoIXBkZkpzVmVyc2lvbi5zdGFydHNXaXRoKCc0LjcnKSkge1xuICAgICAgICA8ZGl2IGlkPVwiZWRpdG9yVW5kb0JhclwiIGNsYXNzPVwibWVzc2FnZUJhclwiIHJvbGU9XCJzdGF0dXNcIiBhcmlhLWxhYmVsbGVkYnk9XCJlZGl0b3JVbmRvQmFyTWVzc2FnZVwiIHRhYmluZGV4PVwiLTFcIlxuICAgICAgICAgIGhpZGRlbj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPHNwYW4gaWQ9XCJlZGl0b3JVbmRvQmFyTWVzc2FnZVwiIGNsYXNzPVwiZGVzY3JpcHRpb25cIj48L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJlZGl0b3JVbmRvQmFyVW5kb0J1dHRvblwiIGNsYXNzPVwidW5kb0J1dHRvblwiIHR5cGU9XCJidXR0b25cIiB0YWJpbmRleD1cIjBcIiB0aXRsZT1cIlVuZG9cIlxuICAgICAgICAgICAgICBkYXRhLWwxMG4taWQ9XCJwZGZqcy1lZGl0b3ItdW5kby1iYXItdW5kby1idXR0b25cIj5cbiAgICAgICAgICAgICAgPHNwYW4gZGF0YS1sMTBuLWlkPVwicGRmanMtZWRpdG9yLXVuZG8tYmFyLXVuZG8tYnV0dG9uLWxhYmVsXCI+VW5kbzwvc3Bhbj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImVkaXRvclVuZG9CYXJDbG9zZUJ1dHRvblwiIGNsYXNzPVwiY2xvc2VCdXR0b25cIiB0eXBlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgdGl0bGU9XCJDbG9zZVwiXG4gICAgICAgICAgICAgIGRhdGEtbDEwbi1pZD1cInBkZmpzLWVkaXRvci11bmRvLWJhci1jbG9zZS1idXR0b25cIj5cbiAgICAgICAgICAgICAgPHNwYW4gZGF0YS1sMTBuLWlkPVwicGRmanMtZWRpdG9yLXVuZG8tYmFyLWNsb3NlLWJ1dHRvbi1sYWJlbFwiPkNsb3NlPC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PiA8IS0tIGVkaXRvclVuZG9CYXIgLS0+XG4gICAgICAgIH1cbiAgICAgICAgPCEtLSBvdXRlckNvbnRhaW5lciAtLT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbjwvbmctdGVtcGxhdGU+XG5cbjxuZy10ZW1wbGF0ZSAjZGVmYXVsdEZyZWVGbG9hdGluZ0Jhcj4gPC9uZy10ZW1wbGF0ZT4iXX0=