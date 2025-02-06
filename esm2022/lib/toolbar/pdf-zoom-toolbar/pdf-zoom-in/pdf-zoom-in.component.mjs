import { Component, effect, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../../pdf-notification-service";
import * as i2 from "../../pdf-shy-button/pdf-shy-button.component";
import * as i3 from "../../../responsive-visibility";
export class PdfZoomInComponent {
    showZoomButtons = true;
    disabled = true;
    PDFViewerApplication;
    eventListener = ({ source, scale }) => {
        const maxZoom = source.maxZoom;
        if (maxZoom) {
            this.disabled = scale >= maxZoom;
        }
        else {
            this.disabled = false;
        }
    };
    constructor(notificationService) {
        effect(() => {
            this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
            if (this.PDFViewerApplication) {
                this.onPdfJsInit();
            }
        });
    }
    onPdfJsInit() {
        this.PDFViewerApplication?.eventBus.on('scalechanging', this.eventListener);
    }
    ngOnDestroy() {
        this.PDFViewerApplication?.eventBus.off('scalechanging', this.eventListener);
        this.PDFViewerApplication = undefined;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfZoomInComponent, deps: [{ token: i1.PDFNotificationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfZoomInComponent, selector: "pdf-zoom-in", inputs: { showZoomButtons: "showZoomButtons" }, ngImport: i0, template: "<pdf-shy-button\n  primaryToolbarId=\"primaryZoomIn\"\n  [cssClass]=\"showZoomButtons | responsiveCSSClass : 'always-visible'\"\n  class=\"zoomIn\"\n  title=\"Zoom In\"\n  l10nId=\"pdfjs-zoom-in-button\"\n  l10nLabel=\"pdfjs-zoom-in-button-label\"\n  eventBusName=\"zoomin\"\n  [order]=\"1600\"\n  image=\"<svg width='24px' height='24px' viewBox='0 0 24 24'><path fill='currentColor' d='M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z' /></svg>\"\n  [disabled]=\"disabled\"\n>\n</pdf-shy-button>\n", styles: ["button{margin-left:-2px!important;margin-right:-2px!important;padding:0}\n"], dependencies: [{ kind: "component", type: i2.PdfShyButtonComponent, selector: "pdf-shy-button", inputs: ["primaryToolbarId", "secondaryMenuId", "cssClass", "eventBusName", "l10nId", "l10nLabel", "title", "toggled", "disabled", "order", "action", "closeOnClick", "onlySecondaryMenu", "image"] }, { kind: "pipe", type: i3.ResponsiveCSSClassPipe, name: "responsiveCSSClass" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfZoomInComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-zoom-in', template: "<pdf-shy-button\n  primaryToolbarId=\"primaryZoomIn\"\n  [cssClass]=\"showZoomButtons | responsiveCSSClass : 'always-visible'\"\n  class=\"zoomIn\"\n  title=\"Zoom In\"\n  l10nId=\"pdfjs-zoom-in-button\"\n  l10nLabel=\"pdfjs-zoom-in-button-label\"\n  eventBusName=\"zoomin\"\n  [order]=\"1600\"\n  image=\"<svg width='24px' height='24px' viewBox='0 0 24 24'><path fill='currentColor' d='M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z' /></svg>\"\n  [disabled]=\"disabled\"\n>\n</pdf-shy-button>\n", styles: ["button{margin-left:-2px!important;margin-right:-2px!important;padding:0}\n"] }]
        }], ctorParameters: () => [{ type: i1.PDFNotificationService }], propDecorators: { showZoomButtons: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLXpvb20taW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIvc3JjL2xpYi90b29sYmFyL3BkZi16b29tLXRvb2xiYXIvcGRmLXpvb20taW4vcGRmLXpvb20taW4uY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIvc3JjL2xpYi90b29sYmFyL3BkZi16b29tLXRvb2xiYXIvcGRmLXpvb20taW4vcGRmLXpvb20taW4uY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFhLE1BQU0sZUFBZSxDQUFDOzs7OztBQVdwRSxNQUFNLE9BQU8sa0JBQWtCO0lBRXRCLGVBQWUsR0FBeUIsSUFBSSxDQUFDO0lBRTdDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDdkIsb0JBQW9CLENBQW9DO0lBRWhELGFBQWEsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBc0IsRUFBRSxFQUFFO1FBQ2hFLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDL0IsSUFBSSxPQUFPLEVBQUU7WUFDWCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssSUFBSSxPQUFPLENBQUM7U0FDbEM7YUFBTTtZQUNMLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1NBQ3ZCO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsWUFBWSxtQkFBMkM7UUFDckQsTUFBTSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3BFLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUM3QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDcEI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxXQUFXO1FBQ2pCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVNLFdBQVc7UUFDaEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFDO0lBQ3hDLENBQUM7d0dBaENVLGtCQUFrQjs0RkFBbEIsa0JBQWtCLG1HQ1gvQiw2ZUFhQTs7NEZERmEsa0JBQWtCO2tCQUw5QixTQUFTOytCQUNFLGFBQWE7MkZBTWhCLGVBQWU7c0JBRHJCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIGVmZmVjdCwgSW5wdXQsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU2NhbGVDaGFuZ2luZ0V2ZW50IH0gZnJvbSAnLi4vLi4vLi4vZXZlbnRzL3NjYWxlLWNoYW5naW5nLWV2ZW50JztcbmltcG9ydCB7IElQREZWaWV3ZXJBcHBsaWNhdGlvbiB9IGZyb20gJy4uLy4uLy4uL29wdGlvbnMvcGRmLXZpZXdlci1hcHBsaWNhdGlvbic7XG5pbXBvcnQgeyBQREZOb3RpZmljYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vcGRmLW5vdGlmaWNhdGlvbi1zZXJ2aWNlJztcbmltcG9ydCB7IFJlc3BvbnNpdmVWaXNpYmlsaXR5IH0gZnJvbSAnLi4vLi4vLi4vcmVzcG9uc2l2ZS12aXNpYmlsaXR5JztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGRmLXpvb20taW4nLFxuICB0ZW1wbGF0ZVVybDogJy4vcGRmLXpvb20taW4uY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9wZGYtem9vbS1pbi5jb21wb25lbnQuY3NzJ10sXG59KVxuZXhwb3J0IGNsYXNzIFBkZlpvb21JbkNvbXBvbmVudCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93Wm9vbUJ1dHRvbnM6IFJlc3BvbnNpdmVWaXNpYmlsaXR5ID0gdHJ1ZTtcblxuICBwdWJsaWMgZGlzYWJsZWQgPSB0cnVlO1xuICBQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uIHwgdW5kZWZpbmVkO1xuXG4gIHByaXZhdGUgZXZlbnRMaXN0ZW5lciA9ICh7IHNvdXJjZSwgc2NhbGUgfTogU2NhbGVDaGFuZ2luZ0V2ZW50KSA9PiB7XG4gICAgY29uc3QgbWF4Wm9vbSA9IHNvdXJjZS5tYXhab29tO1xuICAgIGlmIChtYXhab29tKSB7XG4gICAgICB0aGlzLmRpc2FibGVkID0gc2NhbGUgPj0gbWF4Wm9vbTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihub3RpZmljYXRpb25TZXJ2aWNlOiBQREZOb3RpZmljYXRpb25TZXJ2aWNlKSB7XG4gICAgZWZmZWN0KCgpID0+IHtcbiAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24gPSBub3RpZmljYXRpb25TZXJ2aWNlLm9uUERGSlNJbml0U2lnbmFsKCk7XG4gICAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgICB0aGlzLm9uUGRmSnNJbml0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uUGRmSnNJbml0KCkge1xuICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LmV2ZW50QnVzLm9uKCdzY2FsZWNoYW5naW5nJywgdGhpcy5ldmVudExpc3RlbmVyKTtcbiAgfVxuXG4gIHB1YmxpYyBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5ldmVudEJ1cy5vZmYoJ3NjYWxlY2hhbmdpbmcnLCB0aGlzLmV2ZW50TGlzdGVuZXIpO1xuICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24gPSB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsIjxwZGYtc2h5LWJ1dHRvblxuICBwcmltYXJ5VG9vbGJhcklkPVwicHJpbWFyeVpvb21JblwiXG4gIFtjc3NDbGFzc109XCJzaG93Wm9vbUJ1dHRvbnMgfCByZXNwb25zaXZlQ1NTQ2xhc3MgOiAnYWx3YXlzLXZpc2libGUnXCJcbiAgY2xhc3M9XCJ6b29tSW5cIlxuICB0aXRsZT1cIlpvb20gSW5cIlxuICBsMTBuSWQ9XCJwZGZqcy16b29tLWluLWJ1dHRvblwiXG4gIGwxMG5MYWJlbD1cInBkZmpzLXpvb20taW4tYnV0dG9uLWxhYmVsXCJcbiAgZXZlbnRCdXNOYW1lPVwiem9vbWluXCJcbiAgW29yZGVyXT1cIjE2MDBcIlxuICBpbWFnZT1cIjxzdmcgd2lkdGg9JzI0cHgnIGhlaWdodD0nMjRweCcgdmlld0JveD0nMCAwIDI0IDI0Jz48cGF0aCBmaWxsPSdjdXJyZW50Q29sb3InIGQ9J00xOSwxM0gxM1YxOUgxMVYxM0g1VjExSDExVjVIMTNWMTFIMTlWMTNaJyAvPjwvc3ZnPlwiXG4gIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiXG4+XG48L3BkZi1zaHktYnV0dG9uPlxuIl19