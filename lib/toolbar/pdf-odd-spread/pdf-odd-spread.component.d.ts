import { ScrollModeType } from '../../options/pdf-viewer';
import { SpreadType } from '../../options/spread-type';
import { PDFNotificationService } from '../../pdf-notification-service';
import { ResponsiveVisibility } from '../../responsive-visibility';
import * as i0 from "@angular/core";
export declare class PdfOddSpreadComponent {
    private notificationService;
    show: ResponsiveVisibility;
    scrollMode: ScrollModeType;
    spread: SpreadType;
    private PDFViewerApplication;
    constructor(notificationService: PDFNotificationService);
    onPdfJsInit(): void;
    onClick(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PdfOddSpreadComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PdfOddSpreadComponent, "pdf-odd-spread", never, { "show": { "alias": "show"; "required": false; }; "scrollMode": { "alias": "scrollMode"; "required": false; }; }, {}, never, never, false, never>;
}
