import { EventEmitter, OnDestroy } from '@angular/core';
import { PageViewModeType, ScrollModeType } from '../../options/pdf-viewer';
import { PDFNotificationService } from '../../pdf-notification-service';
import { ResponsiveVisibility } from '../../responsive-visibility';
import * as i0 from "@angular/core";
export declare class PdfWrappedScrollModeComponent implements OnDestroy {
    private notificationService;
    show: ResponsiveVisibility;
    scrollMode: ScrollModeType;
    pageViewMode: PageViewModeType;
    pageViewModeChange: EventEmitter<PageViewModeType>;
    onClick?: () => void;
    private PDFViewerApplication;
    constructor(notificationService: PDFNotificationService);
    onPdfJsInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PdfWrappedScrollModeComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PdfWrappedScrollModeComponent, "pdf-wrapped-scroll-mode", never, { "show": { "alias": "show"; "required": false; }; "scrollMode": { "alias": "scrollMode"; "required": false; }; "pageViewMode": { "alias": "pageViewMode"; "required": false; }; }, { "pageViewModeChange": "pageViewModeChange"; }, never, never, false, never>;
}
