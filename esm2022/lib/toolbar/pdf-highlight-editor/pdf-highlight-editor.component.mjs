import { Component, Input, effect } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../pdf-notification-service";
import * as i2 from "../pdf-shy-button/pdf-shy-button.component";
import * as i3 from "../../responsive-visibility";
export class PdfHighlightEditorComponent {
    notificationService;
    cdr;
    show = true;
    isSelected = false;
    PDFViewerApplication;
    constructor(notificationService, cdr) {
        this.notificationService = notificationService;
        this.cdr = cdr;
        effect(() => {
            this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
            if (this.PDFViewerApplication) {
                this.onPdfJsInit();
            }
        });
    }
    onPdfJsInit() {
        this.PDFViewerApplication?.eventBus.on('annotationeditormodechanged', ({ mode }) => {
            setTimeout(() => {
                this.isSelected = mode === 9;
                this.cdr.detectChanges();
            });
        });
    }
    onClick(event) {
        let button = event.target;
        while (button && button instanceof Element && !(button instanceof HTMLButtonElement)) {
            button = button.parentElement;
        }
        if (button instanceof HTMLButtonElement) {
            if (button.id !== 'primaryEditorHighlight') {
                document.getElementById('primaryEditorHighlight')?.click();
            }
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfHighlightEditorComponent, deps: [{ token: i1.PDFNotificationService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfHighlightEditorComponent, selector: "pdf-highlight-editor", inputs: { show: "show" }, ngImport: i0, template: "<pdf-shy-button\n  title=\"Highlight\"\n  primaryToolbarId=\"primaryEditorHighlight\"\n  [cssClass]=\"show | responsiveCSSClass : 'hiddenTinyView'\"\n  l10nId=\"pdfjs-editor-highlight-button\"\n  l10nLabel=\"pdfjs-editor-highlight-button-label\"\n  [order]=\"4000\"\n  [action]=\"onClick\"\n  [toggled]=\"isSelected\"\n  [closeOnClick]=\"true\"\n  image=\"<svg width='20px' height='20px' viewBox='0 0 24 24'> <path fill='currentColor' d='M18.5,1.15C17.97,1.15 17.46,1.34 17.07,1.73L11.26,7.55L16.91,13.2L22.73,7.39C23.5,6.61 23.5,5.35 22.73,4.56L19.89,1.73C19.5,1.34 19,1.15 18.5,1.15M10.3,8.5L4.34,14.46C3.56,15.24 3.56,16.5 4.36,17.31C3.14,18.54 1.9,19.77 0.67,21H6.33L7.19,20.14C7.97,20.9 9.22,20.89 10,20.12L15.95,14.16' /></svg>\"\n>\n</pdf-shy-button>\n", styles: ["button{padding:0}\n"], dependencies: [{ kind: "component", type: i2.PdfShyButtonComponent, selector: "pdf-shy-button", inputs: ["primaryToolbarId", "secondaryMenuId", "cssClass", "eventBusName", "l10nId", "l10nLabel", "title", "toggled", "disabled", "order", "action", "closeOnClick", "onlySecondaryMenu", "image"] }, { kind: "pipe", type: i3.ResponsiveCSSClassPipe, name: "responsiveCSSClass" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfHighlightEditorComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-highlight-editor', template: "<pdf-shy-button\n  title=\"Highlight\"\n  primaryToolbarId=\"primaryEditorHighlight\"\n  [cssClass]=\"show | responsiveCSSClass : 'hiddenTinyView'\"\n  l10nId=\"pdfjs-editor-highlight-button\"\n  l10nLabel=\"pdfjs-editor-highlight-button-label\"\n  [order]=\"4000\"\n  [action]=\"onClick\"\n  [toggled]=\"isSelected\"\n  [closeOnClick]=\"true\"\n  image=\"<svg width='20px' height='20px' viewBox='0 0 24 24'> <path fill='currentColor' d='M18.5,1.15C17.97,1.15 17.46,1.34 17.07,1.73L11.26,7.55L16.91,13.2L22.73,7.39C23.5,6.61 23.5,5.35 22.73,4.56L19.89,1.73C19.5,1.34 19,1.15 18.5,1.15M10.3,8.5L4.34,14.46C3.56,15.24 3.56,16.5 4.36,17.31C3.14,18.54 1.9,19.77 0.67,21H6.33L7.19,20.14C7.97,20.9 9.22,20.89 10,20.12L15.95,14.16' /></svg>\"\n>\n</pdf-shy-button>\n", styles: ["button{padding:0}\n"] }]
        }], ctorParameters: () => [{ type: i1.PDFNotificationService }, { type: i0.ChangeDetectorRef }], propDecorators: { show: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLWhpZ2hsaWdodC1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIvc3JjL2xpYi90b29sYmFyL3BkZi1oaWdobGlnaHQtZWRpdG9yL3BkZi1oaWdobGlnaHQtZWRpdG9yLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvdG9vbGJhci9wZGYtaGlnaGxpZ2h0LWVkaXRvci9wZGYtaGlnaGxpZ2h0LWVkaXRvci5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXFCLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7OztBQVc1RSxNQUFNLE9BQU8sMkJBQTJCO0lBUWxCO0lBQXFEO0lBTmxFLElBQUksR0FBeUIsSUFBSSxDQUFDO0lBRWxDLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFFbEIsb0JBQW9CLENBQW9DO0lBRWhFLFlBQW9CLG1CQUEyQyxFQUFVLEdBQXNCO1FBQTNFLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBd0I7UUFBVSxRQUFHLEdBQUgsR0FBRyxDQUFtQjtRQUM3RixNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDcEUsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUNwQjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLFdBQVc7UUFDakIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBMEMsRUFBRSxFQUFFO1lBQ3pILFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDO2dCQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sT0FBTyxDQUFDLEtBQW1CO1FBQ2hDLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDMUIsT0FBTyxNQUFNLElBQUksTUFBTSxZQUFZLE9BQU8sSUFBSSxDQUFDLENBQUMsTUFBTSxZQUFZLGlCQUFpQixDQUFDLEVBQUU7WUFDcEYsTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7U0FDL0I7UUFDRCxJQUFJLE1BQU0sWUFBWSxpQkFBaUIsRUFBRTtZQUN2QyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssd0JBQXdCLEVBQUU7Z0JBQzFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUM1RDtTQUNGO0lBQ0gsQ0FBQzt3R0FwQ1UsMkJBQTJCOzRGQUEzQiwyQkFBMkIsc0ZDWHhDLHl2QkFhQTs7NEZERmEsMkJBQTJCO2tCQUx2QyxTQUFTOytCQUNFLHNCQUFzQjsySEFNekIsSUFBSTtzQkFEVixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgSW5wdXQsIGVmZmVjdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQW5ub3RhdGlvbkVkaXRvckVkaXRvck1vZGVDaGFuZ2VkRXZlbnQgfSBmcm9tICcuLi8uLi9ldmVudHMvYW5ub3RhdGlvbi1lZGl0b3ItbW9kZS1jaGFuZ2VkLWV2ZW50JztcbmltcG9ydCB7IElQREZWaWV3ZXJBcHBsaWNhdGlvbiB9IGZyb20gJy4uLy4uL29wdGlvbnMvcGRmLXZpZXdlci1hcHBsaWNhdGlvbic7XG5pbXBvcnQgeyBQREZOb3RpZmljYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vcGRmLW5vdGlmaWNhdGlvbi1zZXJ2aWNlJztcbmltcG9ydCB7IFJlc3BvbnNpdmVWaXNpYmlsaXR5IH0gZnJvbSAnLi4vLi4vcmVzcG9uc2l2ZS12aXNpYmlsaXR5JztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGRmLWhpZ2hsaWdodC1lZGl0b3InLFxuICB0ZW1wbGF0ZVVybDogJy4vcGRmLWhpZ2hsaWdodC1lZGl0b3IuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9wZGYtaGlnaGxpZ2h0LWVkaXRvci5jb21wb25lbnQuY3NzJ10sXG59KVxuZXhwb3J0IGNsYXNzIFBkZkhpZ2hsaWdodEVkaXRvckNvbXBvbmVudCB7XG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93OiBSZXNwb25zaXZlVmlzaWJpbGl0eSA9IHRydWU7XG5cbiAgcHVibGljIGlzU2VsZWN0ZWQgPSBmYWxzZTtcblxuICBwcml2YXRlIFBERlZpZXdlckFwcGxpY2F0aW9uOiBJUERGVmlld2VyQXBwbGljYXRpb24gfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBub3RpZmljYXRpb25TZXJ2aWNlOiBQREZOb3RpZmljYXRpb25TZXJ2aWNlLCBwcml2YXRlIGNkcjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgICBlZmZlY3QoKCkgPT4ge1xuICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbiA9IG5vdGlmaWNhdGlvblNlcnZpY2Uub25QREZKU0luaXRTaWduYWwoKTtcbiAgICAgIGlmICh0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XG4gICAgICAgIHRoaXMub25QZGZKc0luaXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgb25QZGZKc0luaXQoKSB7XG4gICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8uZXZlbnRCdXMub24oJ2Fubm90YXRpb25lZGl0b3Jtb2RlY2hhbmdlZCcsICh7IG1vZGUgfTogQW5ub3RhdGlvbkVkaXRvckVkaXRvck1vZGVDaGFuZ2VkRXZlbnQpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmlzU2VsZWN0ZWQgPSBtb2RlID09PSA5O1xuICAgICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkNsaWNrKGV2ZW50OiBQb2ludGVyRXZlbnQpOiB2b2lkIHtcbiAgICBsZXQgYnV0dG9uID0gZXZlbnQudGFyZ2V0O1xuICAgIHdoaWxlIChidXR0b24gJiYgYnV0dG9uIGluc3RhbmNlb2YgRWxlbWVudCAmJiAhKGJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSkge1xuICAgICAgYnV0dG9uID0gYnV0dG9uLnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuICAgIGlmIChidXR0b24gaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgaWYgKGJ1dHRvbi5pZCAhPT0gJ3ByaW1hcnlFZGl0b3JIaWdobGlnaHQnKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmltYXJ5RWRpdG9ySGlnaGxpZ2h0Jyk/LmNsaWNrKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCI8cGRmLXNoeS1idXR0b25cbiAgdGl0bGU9XCJIaWdobGlnaHRcIlxuICBwcmltYXJ5VG9vbGJhcklkPVwicHJpbWFyeUVkaXRvckhpZ2hsaWdodFwiXG4gIFtjc3NDbGFzc109XCJzaG93IHwgcmVzcG9uc2l2ZUNTU0NsYXNzIDogJ2hpZGRlblRpbnlWaWV3J1wiXG4gIGwxMG5JZD1cInBkZmpzLWVkaXRvci1oaWdobGlnaHQtYnV0dG9uXCJcbiAgbDEwbkxhYmVsPVwicGRmanMtZWRpdG9yLWhpZ2hsaWdodC1idXR0b24tbGFiZWxcIlxuICBbb3JkZXJdPVwiNDAwMFwiXG4gIFthY3Rpb25dPVwib25DbGlja1wiXG4gIFt0b2dnbGVkXT1cImlzU2VsZWN0ZWRcIlxuICBbY2xvc2VPbkNsaWNrXT1cInRydWVcIlxuICBpbWFnZT1cIjxzdmcgd2lkdGg9JzIwcHgnIGhlaWdodD0nMjBweCcgdmlld0JveD0nMCAwIDI0IDI0Jz4gPHBhdGggZmlsbD0nY3VycmVudENvbG9yJyBkPSdNMTguNSwxLjE1QzE3Ljk3LDEuMTUgMTcuNDYsMS4zNCAxNy4wNywxLjczTDExLjI2LDcuNTVMMTYuOTEsMTMuMkwyMi43Myw3LjM5QzIzLjUsNi42MSAyMy41LDUuMzUgMjIuNzMsNC41NkwxOS44OSwxLjczQzE5LjUsMS4zNCAxOSwxLjE1IDE4LjUsMS4xNU0xMC4zLDguNUw0LjM0LDE0LjQ2QzMuNTYsMTUuMjQgMy41NiwxNi41IDQuMzYsMTcuMzFDMy4xNCwxOC41NCAxLjksMTkuNzcgMC42NywyMUg2LjMzTDcuMTksMjAuMTRDNy45NywyMC45IDkuMjIsMjAuODkgMTAsMjAuMTJMMTUuOTUsMTQuMTYnIC8+PC9zdmc+XCJcbj5cbjwvcGRmLXNoeS1idXR0b24+XG4iXX0=