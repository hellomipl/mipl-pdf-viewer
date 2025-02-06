import { Component, effect, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../pdf-notification-service";
import * as i2 from "../pdf-shy-button/pdf-shy-button.component";
import * as i3 from "../../responsive-visibility";
export class PdfFindButtonComponent {
    notificationService;
    showFindButton = undefined;
    // This is set internally by the viewer after loading a document. If the document has a text layer, the viewer will set this to true.
    hasTextLayer = false;
    textLayer = undefined;
    findbarVisible = false;
    PDFViewerApplication;
    constructor(notificationService) {
        this.notificationService = notificationService;
        effect(() => {
            this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
        });
    }
    onClick() {
        const PDFViewerApplication = this.PDFViewerApplication;
        if (PDFViewerApplication.findBar.opened) {
            PDFViewerApplication.findBar.close();
        }
        else {
            PDFViewerApplication.findBar.open();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfFindButtonComponent, deps: [{ token: i1.PDFNotificationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfFindButtonComponent, selector: "pdf-find-button", inputs: { showFindButton: "showFindButton", hasTextLayer: "hasTextLayer", textLayer: "textLayer", findbarVisible: "findbarVisible" }, ngImport: i0, template: "<pdf-shy-button\n  [cssClass]=\"showFindButton | responsiveCSSClass : ((textLayer && hasTextLayer) ? 'always-visible' : 'invisible')\"\n  primaryToolbarId=\"primaryViewFind\" title=\"Find in Document\" l10nId=\"pdfjs-findbar-button\"\n  l10nLabel=\"pdfjs-findbar-button-label\" [order]=\"1400\" [action]=\"onClick\" [toggled]=\"findbarVisible\"\n  image=\"<svg width='24px' height='24px' viewBox='0 0 24 24'> <path fill='currentColor' d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' /> </svg>\">\n</pdf-shy-button>", styles: [":host:focus{outline:none}button:focus{outline:none}svg:focus{outline:none}button{padding:0}\n"], dependencies: [{ kind: "component", type: i2.PdfShyButtonComponent, selector: "pdf-shy-button", inputs: ["primaryToolbarId", "secondaryMenuId", "cssClass", "eventBusName", "l10nId", "l10nLabel", "title", "toggled", "disabled", "order", "action", "closeOnClick", "onlySecondaryMenu", "image"] }, { kind: "pipe", type: i3.ResponsiveCSSClassPipe, name: "responsiveCSSClass" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfFindButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-find-button', template: "<pdf-shy-button\n  [cssClass]=\"showFindButton | responsiveCSSClass : ((textLayer && hasTextLayer) ? 'always-visible' : 'invisible')\"\n  primaryToolbarId=\"primaryViewFind\" title=\"Find in Document\" l10nId=\"pdfjs-findbar-button\"\n  l10nLabel=\"pdfjs-findbar-button-label\" [order]=\"1400\" [action]=\"onClick\" [toggled]=\"findbarVisible\"\n  image=\"<svg width='24px' height='24px' viewBox='0 0 24 24'> <path fill='currentColor' d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' /> </svg>\">\n</pdf-shy-button>", styles: [":host:focus{outline:none}button:focus{outline:none}svg:focus{outline:none}button{padding:0}\n"] }]
        }], ctorParameters: () => [{ type: i1.PDFNotificationService }], propDecorators: { showFindButton: [{
                type: Input
            }], hasTextLayer: [{
                type: Input
            }], textLayer: [{
                type: Input
            }], findbarVisible: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLWZpbmQtYnV0dG9uLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvdG9vbGJhci9wZGYtZmluZC1idXR0b24vcGRmLWZpbmQtYnV0dG9uLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvdG9vbGJhci9wZGYtZmluZC1idXR0b24vcGRmLWZpbmQtYnV0dG9uLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQzs7Ozs7QUFVekQsTUFBTSxPQUFPLHNCQUFzQjtJQWVkO0lBYlosY0FBYyxHQUFxQyxTQUFTLENBQUM7SUFFcEUscUlBQXFJO0lBRTlILFlBQVksR0FBRyxLQUFLLENBQUM7SUFHckIsU0FBUyxHQUF3QixTQUFTLENBQUM7SUFHM0MsY0FBYyxHQUFHLEtBQUssQ0FBQztJQUN0QixvQkFBb0IsQ0FBcUM7SUFFakUsWUFBbUIsbUJBQTJDO1FBQTNDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBd0I7UUFDNUQsTUFBTSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3RFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLE9BQU87UUFDWixNQUFNLG9CQUFvQixHQUFRLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztRQUM1RCxJQUFJLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDdkMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3RDO2FBQU07WUFDTCxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDckM7SUFDSCxDQUFDO3dHQTVCVSxzQkFBc0I7NEZBQXRCLHNCQUFzQiw2TENWbkMsMHRCQUtpQjs7NEZES0osc0JBQXNCO2tCQUxsQyxTQUFTOytCQUNFLGlCQUFpQjsyRkFNcEIsY0FBYztzQkFEcEIsS0FBSztnQkFLQyxZQUFZO3NCQURsQixLQUFLO2dCQUlDLFNBQVM7c0JBRGYsS0FBSztnQkFJQyxjQUFjO3NCQURwQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBlZmZlY3QsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBJUERGVmlld2VyQXBwbGljYXRpb24gfSBmcm9tICcuLi8uLi9vcHRpb25zL3BkZi12aWV3ZXItYXBwbGljYXRpb24nO1xuaW1wb3J0IHsgUERGTm90aWZpY2F0aW9uU2VydmljZSB9IGZyb20gJy4uLy4uL3BkZi1ub3RpZmljYXRpb24tc2VydmljZSc7XG5pbXBvcnQgeyBSZXNwb25zaXZlVmlzaWJpbGl0eSB9IGZyb20gJy4uLy4uL3Jlc3BvbnNpdmUtdmlzaWJpbGl0eSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3BkZi1maW5kLWJ1dHRvbicsXG4gIHRlbXBsYXRlVXJsOiAnLi9wZGYtZmluZC1idXR0b24uY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9wZGYtZmluZC1idXR0b24uY29tcG9uZW50LmNzcyddLFxufSlcbmV4cG9ydCBjbGFzcyBQZGZGaW5kQnV0dG9uQ29tcG9uZW50IHtcbiAgQElucHV0KClcbiAgcHVibGljIHNob3dGaW5kQnV0dG9uOiBSZXNwb25zaXZlVmlzaWJpbGl0eSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAvLyBUaGlzIGlzIHNldCBpbnRlcm5hbGx5IGJ5IHRoZSB2aWV3ZXIgYWZ0ZXIgbG9hZGluZyBhIGRvY3VtZW50LiBJZiB0aGUgZG9jdW1lbnQgaGFzIGEgdGV4dCBsYXllciwgdGhlIHZpZXdlciB3aWxsIHNldCB0aGlzIHRvIHRydWUuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBoYXNUZXh0TGF5ZXIgPSBmYWxzZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgdGV4dExheWVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBmaW5kYmFyVmlzaWJsZSA9IGZhbHNlO1xuICBwcml2YXRlIFBERlZpZXdlckFwcGxpY2F0aW9uITogSVBERlZpZXdlckFwcGxpY2F0aW9uIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBub3RpZmljYXRpb25TZXJ2aWNlOiBQREZOb3RpZmljYXRpb25TZXJ2aWNlKSB7XG4gICAgZWZmZWN0KCgpID0+IHtcbiAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24gPSBub3RpZmljYXRpb25TZXJ2aWNlLm9uUERGSlNJbml0U2lnbmFsKCk7XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25DbGljaygpIHtcbiAgICBjb25zdCBQREZWaWV3ZXJBcHBsaWNhdGlvbjogYW55ID0gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcbiAgICBpZiAoUERGVmlld2VyQXBwbGljYXRpb24uZmluZEJhci5vcGVuZWQpIHtcbiAgICAgIFBERlZpZXdlckFwcGxpY2F0aW9uLmZpbmRCYXIuY2xvc2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgUERGVmlld2VyQXBwbGljYXRpb24uZmluZEJhci5vcGVuKCk7XG4gICAgfVxuICB9XG59XG4iLCI8cGRmLXNoeS1idXR0b25cbiAgW2Nzc0NsYXNzXT1cInNob3dGaW5kQnV0dG9uIHwgcmVzcG9uc2l2ZUNTU0NsYXNzIDogKCh0ZXh0TGF5ZXIgJiYgaGFzVGV4dExheWVyKSA/ICdhbHdheXMtdmlzaWJsZScgOiAnaW52aXNpYmxlJylcIlxuICBwcmltYXJ5VG9vbGJhcklkPVwicHJpbWFyeVZpZXdGaW5kXCIgdGl0bGU9XCJGaW5kIGluIERvY3VtZW50XCIgbDEwbklkPVwicGRmanMtZmluZGJhci1idXR0b25cIlxuICBsMTBuTGFiZWw9XCJwZGZqcy1maW5kYmFyLWJ1dHRvbi1sYWJlbFwiIFtvcmRlcl09XCIxNDAwXCIgW2FjdGlvbl09XCJvbkNsaWNrXCIgW3RvZ2dsZWRdPVwiZmluZGJhclZpc2libGVcIlxuICBpbWFnZT1cIjxzdmcgd2lkdGg9JzI0cHgnIGhlaWdodD0nMjRweCcgdmlld0JveD0nMCAwIDI0IDI0Jz4gPHBhdGggZmlsbD0nY3VycmVudENvbG9yJyBkPSdNOS41LDNBNi41LDYuNSAwIDAsMSAxNiw5LjVDMTYsMTEuMTEgMTUuNDEsMTIuNTkgMTQuNDQsMTMuNzNMMTQuNzEsMTRIMTUuNUwyMC41LDE5TDE5LDIwLjVMMTQsMTUuNVYxNC43MUwxMy43MywxNC40NEMxMi41OSwxNS40MSAxMS4xMSwxNiA5LjUsMTZBNi41LDYuNSAwIDAsMSAzLDkuNUE2LjUsNi41IDAgMCwxIDkuNSwzTTkuNSw1QzcsNSA1LDcgNSw5LjVDNSwxMiA3LDE0IDkuNSwxNEMxMiwxNCAxNCwxMiAxNCw5LjVDMTQsNyAxMiw1IDkuNSw1WicgLz4gPC9zdmc+XCI+XG48L3BkZi1zaHktYnV0dG9uPiJdfQ==