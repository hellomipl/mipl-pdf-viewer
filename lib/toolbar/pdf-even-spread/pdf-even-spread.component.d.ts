import { ScrollModeType } from '../../options/pdf-viewer';
import { SpreadType } from '../../options/spread-type';
import { PDFNotificationService } from '../../pdf-notification-service';
import { ResponsiveVisibility } from '../../responsive-visibility';
import * as i0 from "@angular/core";
export declare class PdfEvenSpreadComponent {
    private notificationService;
    show: ResponsiveVisibility;
    spread: SpreadType;
    scrollMode: ScrollModeType;
    private PDFViewerApplication;
    constructor(notificationService: PDFNotificationService);
    onPdfJsInit(): void;
    onClick(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PdfEvenSpreadComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PdfEvenSpreadComponent, "pdf-even-spread", never, { "show": { "alias": "show"; "required": false; }; "scrollMode": { "alias": "scrollMode"; "required": false; }; }, {}, never, never, false, never>;
}
