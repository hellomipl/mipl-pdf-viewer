import { OnDestroy } from '@angular/core';
import { IPDFViewerApplication } from './options/pdf-viewer-application';
import { IPDFViewerApplicationOptions } from './options/pdf-viewer-application-options';
import { PdfCspPolicyService } from './pdf-csp-policy.service';
import * as i0 from "@angular/core";
export declare class PDFScriptLoaderService implements OnDestroy {
    private pdfCspPolicyService;
    private csp_nonce;
    private _forceUsingLegacyES5;
    get forceUsingLegacyES5(): boolean;
    set forceUsingLegacyES5(value: boolean);
    onPDFJSInitSignal: import("@angular/core").WritableSignal<IPDFViewerApplication>;
    pdfjsVersion: string;
    shuttingDown: boolean;
    private _needsES5;
    PDFViewerApplication: IPDFViewerApplication;
    PDFViewerApplicationOptions: IPDFViewerApplicationOptions;
    webViewerLoad: (cspPolicyService: PdfCspPolicyService) => void;
    ngxExtendedPdfViewerIncompletelyInitialized: boolean;
    constructor(pdfCspPolicyService: PdfCspPolicyService, csp_nonce: string);
    private addScriptOpChainingSupport;
    private createInlineScript;
    private isCSPAppliedViaMetaTag;
    private isCSPApplied;
    private createScriptElement;
    private getPdfJsPath;
    private loadViewer;
    private addFeatures;
    ensurePdfJsHasBeenLoaded(useInlineScripts: boolean, forceUsingLegacyES5: boolean): Promise<boolean>;
    ngOnDestroy(): void;
    private iOSVersionRequiresES5;
    private needsES5;
    /**
     * Angular 16 uses zone.js 0.13.3, and this version has a problem with Promise.withResolvers.
     * If your browser supports Promise.withResolvers, zone.js accidentally overwrites it with "undefined".
     * This method adds a polyfill for Promise.withResolvers if it is not available.
     */
    private polyfillPromiseWithResolversIfZoneJSOverwritesIt;
    private ngxExtendedPdfViewerCanRunModernJSCode;
    static ɵfac: i0.ɵɵFactoryDeclaration<PDFScriptLoaderService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PDFScriptLoaderService>;
}
