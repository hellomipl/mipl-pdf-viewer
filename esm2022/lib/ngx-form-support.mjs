import { EventEmitter } from '@angular/core';
export class NgxFormSupport {
    /** Maps the internal ids of the annotations of pdf.js to their field name */
    formIdToFullFieldName = {};
    formIdToField = {};
    radioButtons = {};
    formData = {};
    initialFormDataStoredInThePDF = {};
    formDataChange = new EventEmitter();
    PDFViewerApplication;
    reset() {
        this.formData = {};
        this.formIdToFullFieldName = {};
    }
    registerFormSupportWithPdfjs(PDFViewerApplication) {
        globalThis.getFormValueFromAngular = (key) => this.getFormValueFromAngular(key);
        globalThis.updateAngularFormValue = (key, value) => this.updateAngularFormValueCalledByPdfjs(key, value);
        globalThis.registerAcroformField = (id, element, value, radioButtonValueName, initialValueFromPDF) => this.registerAcroformField(id, element, value, radioButtonValueName, initialValueFromPDF);
        globalThis.registerXFAField = (element, value, initialValueFromPDF) => this.registerXFAField(element, value, initialValueFromPDF);
    }
    registerAcroformField(id, element, value, radioButtonValueName, initialFormValueFromPDF) {
        const fieldName = element.name;
        this.formIdToField[id] = element;
        this.formIdToFullFieldName[id] = fieldName;
        if (element instanceof HTMLInputElement && element.type === 'radio') {
            const groupName = fieldName;
            this.formIdToFullFieldName[id] = groupName;
            if (value) {
                this.formData[groupName] = radioButtonValueName;
                this.initialFormDataStoredInThePDF[groupName] = initialFormValueFromPDF;
            }
            element.setAttribute('exportValue', radioButtonValueName);
            if (!this.radioButtons[groupName]) {
                this.radioButtons[groupName] = [];
            }
            this.radioButtons[groupName].push(element);
        }
        else if (element instanceof HTMLSelectElement) {
            this.formData[fieldName] = this.getValueOfASelectField(element);
            this.initialFormDataStoredInThePDF[fieldName] = initialFormValueFromPDF;
        }
        else {
            if (value !== undefined) {
                this.formData[fieldName] = value;
            }
            this.initialFormDataStoredInThePDF[fieldName] = initialFormValueFromPDF;
        }
    }
    registerXFAField(element, value, initialFormValueFromPDF) {
        const fullFieldName = this.findFullXFAName(element);
        if (element instanceof HTMLInputElement && element.type === 'radio') {
            const id = element.getAttribute('fieldid') ?? '';
            // remove the xfa name of the radio button itself form the field name,
            // because the field name refers to the entire group of relatated radio buttons
            const groupName = fullFieldName.substring(0, fullFieldName.lastIndexOf('.'));
            this.formIdToFullFieldName[id] = groupName;
            this.formData[groupName] = value?.value;
            this.initialFormDataStoredInThePDF[groupName] = initialFormValueFromPDF;
            if (!this.radioButtons[groupName]) {
                this.radioButtons[groupName] = [];
            }
            this.radioButtons[groupName].push(element);
        }
        else if (element instanceof HTMLInputElement) {
            const id = element.getAttribute('fieldid') ?? '';
            this.formIdToField[id] = element;
            this.formIdToFullFieldName[id] = fullFieldName;
            this.formData[fullFieldName] = value?.value;
            this.initialFormDataStoredInThePDF[fullFieldName] = initialFormValueFromPDF;
        }
        else if (element instanceof HTMLSelectElement) {
            const id = element.getAttribute('fieldid') ?? '';
            this.formIdToField[id] = element;
            this.formIdToFullFieldName[id] = fullFieldName;
            this.formData[fullFieldName] = value?.value;
            this.initialFormDataStoredInThePDF[fullFieldName] = initialFormValueFromPDF;
        }
        else if (element instanceof HTMLTextAreaElement) {
            const id = element.getAttribute('fieldid') ?? '';
            this.formIdToField[id] = element;
            this.formIdToFullFieldName[id] = fullFieldName;
            this.formData[fullFieldName] = value?.value;
            this.initialFormDataStoredInThePDF[fullFieldName] = initialFormValueFromPDF;
        }
        else {
            console.error("Couldn't register an XFA form field", element);
        }
    }
    getValueOfASelectField(selectElement) {
        const { options, multiple } = selectElement;
        if (!multiple) {
            return options.selectedIndex === -1 ? null : options[options.selectedIndex]['value'];
        }
        return Array.prototype.filter.call(options, (option) => option.selected).map((option) => option['value']);
    }
    getFormValueFromAngular(element) {
        let key;
        if (element instanceof HTMLElement) {
            const fieldName = this.findXFAName(element);
            if (fieldName) {
                if (this.formData.hasOwnProperty(fieldName)) {
                    key = fieldName;
                }
                else {
                    key = this.findFullXFAName(element);
                }
            }
            else {
                console.error("Couldn't find the field name or XFA name of the form field", element);
                return { value: null };
            }
        }
        else {
            key = element;
        }
        return { value: this.formData[key] };
    }
    findXFAName(element) {
        let parentElement = element;
        while (!parentElement.getAttribute('xfaname') && parentElement.parentElement) {
            parentElement = parentElement.parentElement;
        }
        if (element instanceof HTMLInputElement && element.type === 'radio') {
            do {
                parentElement = parentElement?.parentElement;
            } while (!parentElement?.getAttribute('xfaname') && parentElement);
        }
        let fieldName = parentElement?.getAttribute('xfaname');
        if (!fieldName) {
            throw new Error("Couldn't find the xfaname of the field");
        }
        return fieldName;
    }
    findFullXFAName(element) {
        let parentElement = element;
        let fieldName = '';
        while (parentElement instanceof HTMLElement && parentElement.parentElement) {
            const xfaName = parentElement.getAttribute('xfaname');
            if (xfaName) {
                fieldName = xfaName + '.' + fieldName;
            }
            parentElement = parentElement.parentElement;
        }
        if (!fieldName) {
            throw new Error("Couldn't find the xfaname of the field");
        }
        fieldName = fieldName.substring(0, fieldName.length - 1);
        if (element instanceof HTMLInputElement && element.type === 'radio') {
            // ignore the last part of the xfaName because it's actually the value of the field
            return fieldName.substring(0, fieldName.lastIndexOf('.'));
        }
        return fieldName;
    }
    updateAngularFormValueCalledByPdfjs(key, value) {
        if (!this.formData) {
            this.formData = {};
        }
        if (typeof key === 'string') {
            const acroFormKey = this.formIdToFullFieldName[key];
            const fullKey = acroFormKey ?? Object.values(this.formIdToFullFieldName).find((k) => k === key || k.endsWith('.' + key));
            if (fullKey) {
                const field = this.formIdToField[key];
                let change = this.doUpdateAngularFormValue(field, value, fullKey);
                if (change) {
                    queueMicrotask(() => this.formDataChange.emit(this.formData));
                }
            }
            else {
                console.error("Couldn't find the field with the name " + key);
            }
        }
        else {
            let change = false;
            const shortFieldName = this.findXFAName(key);
            if (this.formData.hasOwnProperty(shortFieldName)) {
                change = this.doUpdateAngularFormValue(key, value, shortFieldName);
            }
            const fullFieldName = this.findFullXFAName(key);
            if (fullFieldName !== shortFieldName) {
                change ||= this.doUpdateAngularFormValue(key, value, fullFieldName);
            }
            if (change) {
                queueMicrotask(() => this.formDataChange.emit(this.formData));
            }
        }
    }
    doUpdateAngularFormValue(field, value, fullKey) {
        let change = false;
        if (field instanceof HTMLInputElement && field.type === 'checkbox') {
            const exportValue = field.getAttribute('exportvalue');
            if (exportValue) {
                if (value.value) {
                    if (this.formData[fullKey] !== exportValue) {
                        this.formData[fullKey] = exportValue;
                        change = true;
                    }
                }
                else {
                    if (this.formData[fullKey] !== false) {
                        this.formData[fullKey] = false;
                        change = true;
                    }
                }
            }
            else if (this.formData[fullKey] !== value.value) {
                this.formData[fullKey] = value.value;
                change = true;
            }
        }
        else if (field instanceof HTMLInputElement && field.type === 'radio') {
            const exportValue = field.getAttribute('exportvalue') ?? field.getAttribute('xfaon');
            if (value.value) {
                if (this.formData[fullKey] !== exportValue) {
                    this.formData[fullKey] = exportValue;
                    change = true;
                }
            }
        }
        else if (this.formData[fullKey] !== value.value) {
            this.formData[fullKey] = value.value;
            change = true;
        }
        return change;
    }
    updateFormFieldsInPdfCalledByNgOnChanges(previousFormData) {
        if (!this.PDFViewerApplication?.pdfDocument?.annotationStorage) {
            // ngOnChanges calls this method too early - so just ignore it
            return;
        }
        for (const key in this.formData) {
            if (this.formData.hasOwnProperty(key)) {
                const newValue = this.formData[key];
                if (newValue !== previousFormData[key]) {
                    this.setFieldValueAndUpdateAnnotationStorage(key, newValue);
                }
            }
        }
        for (const key in previousFormData) {
            if (previousFormData.hasOwnProperty(key) && previousFormData[key]) {
                let hasPreviousValue = this.formData.hasOwnProperty(key);
                if (!hasPreviousValue) {
                    const fullKey = Object.keys(this.formData).find((k) => k === key || k.endsWith('.' + key));
                    if (fullKey) {
                        hasPreviousValue = this.formData.hasOwnProperty(fullKey);
                    }
                }
                if (!hasPreviousValue) {
                    this.setFieldValueAndUpdateAnnotationStorage(key, null);
                }
            }
        }
    }
    setFieldValueAndUpdateAnnotationStorage(key, newValue) {
        const radios = this.findRadioButtonGroup(key);
        if (radios) {
            radios.forEach((r) => {
                const activeValue = r.getAttribute('exportValue') ?? r.getAttribute('xfaon');
                r.checked = activeValue === newValue;
            });
            const updateFromAngular = new CustomEvent('updateFromAngular', {
                detail: newValue,
            });
            radios[0].dispatchEvent(updateFromAngular);
        }
        else {
            const fieldId = this.findFormIdFromFieldName(key);
            if (fieldId) {
                const htmlField = this.formIdToField[fieldId];
                if (htmlField) {
                    if (htmlField instanceof HTMLInputElement && htmlField.type === 'checkbox') {
                        let activeValue = htmlField.getAttribute('xfaon') ?? htmlField.getAttribute('exportvalue') ?? true;
                        if (newValue === true || newValue === false) {
                            activeValue = true;
                        }
                        htmlField.checked = activeValue === newValue;
                    }
                    else if (htmlField instanceof HTMLSelectElement) {
                        this.populateSelectField(htmlField, newValue);
                    }
                    else {
                        // textareas and input fields
                        htmlField.value = newValue;
                    }
                    const updateFromAngular = new CustomEvent('updateFromAngular', {
                        detail: newValue,
                    });
                    htmlField.dispatchEvent(updateFromAngular);
                }
                else {
                    console.error("Couldn't set the value of the field", key);
                }
            }
        }
    }
    populateSelectField(htmlField, newValue) {
        if (htmlField.multiple) {
            const { options } = htmlField;
            const newValueArray = newValue;
            for (let i = 0; i < options.length; i++) {
                const option = options.item(i);
                if (option) {
                    option.selected = newValueArray.some((o) => o === option.value);
                }
            }
        }
        else {
            htmlField.value = newValue;
        }
    }
    findFormIdFromFieldName(fieldName) {
        if (Object.entries(this.formIdToFullFieldName).length === 0) {
            // sometimes, ngOnChanges() is called before initializing the PDF file
            return undefined;
        }
        const matchingEntries = Object.entries(this.formIdToFullFieldName).filter((entry) => entry[1] === fieldName || entry[1].endsWith('.' + fieldName));
        if (matchingEntries.length > 1) {
            console.log(`More than one field name matches the field name ${fieldName}. Please use the one of these qualified field names:`, matchingEntries.map((f) => f[1]));
            console.log('ngx-extended-pdf-viewer uses the first matching field (which may or may not be the topmost field on your PDF form): ' + matchingEntries[0][0]);
        }
        else if (matchingEntries.length === 0) {
            console.log("Couldn't find the field " + fieldName);
            return undefined;
        }
        return matchingEntries[0][0];
    }
    findRadioButtonGroup(fieldName) {
        const matchingEntries = Object.entries(this.radioButtons).filter((entry) => entry[0].endsWith('.' + fieldName) || entry[0] === fieldName);
        if (matchingEntries.length === 0) {
            return null;
        }
        if (matchingEntries.length > 1) {
            console.log('More than one radio button group name matches this name. Please use the qualified field name', matchingEntries.map((radio) => radio[0]));
            console.log('ngx-extended-pdf-viewer uses the first matching field (which may not be the topmost field on your PDF form): ' + matchingEntries[0][0]);
        }
        return matchingEntries[0][1];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWZvcm0tc3VwcG9ydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvbmd4LWZvcm0tc3VwcG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBSzdDLE1BQU0sT0FBTyxjQUFjO0lBQ3pCLDZFQUE2RTtJQUNyRSxxQkFBcUIsR0FBOEIsRUFBRSxDQUFDO0lBRXRELGFBQWEsR0FBdUMsRUFBRSxDQUFDO0lBRXZELFlBQVksR0FBK0MsRUFBRSxDQUFDO0lBRS9ELFFBQVEsR0FBaUIsRUFBRSxDQUFDO0lBRTVCLDZCQUE2QixHQUFpQixFQUFFLENBQUM7SUFFakQsY0FBYyxHQUFHLElBQUksWUFBWSxFQUFnQixDQUFDO0lBRWpELG9CQUFvQixDQUFvQztJQUV6RCxLQUFLO1FBQ1YsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRU0sNEJBQTRCLENBQUMsb0JBQTJDO1FBQzVFLFVBQWtCLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRyxVQUFrQixDQUFDLHNCQUFzQixHQUFHLENBQUMsR0FBd0UsRUFBRSxLQUF3QixFQUFFLEVBQUUsQ0FDbEosSUFBSSxDQUFDLG1DQUFtQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxVQUFrQixDQUFDLHFCQUFxQixHQUFHLENBQzFDLEVBQVUsRUFDVixPQUF3QixFQUN4QixLQUE2QixFQUM3QixvQkFBNEIsRUFDNUIsbUJBQTJCLEVBQzNCLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxFQUFFLE9B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Q3RKO1FBQ0QsT0FBTyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGb3JtRGF0YVR5cGUsIElQREZWaWV3ZXJBcHBsaWNhdGlvbiB9IGZyb20gJy4uL3B1YmxpY19hcGknO1xuXG5leHBvcnQgdHlwZSBIdG1sRm9ybUVsZW1lbnQgPSBIVE1MSW5wdXRFbGVtZW50IHwgSFRNTFNlbGVjdEVsZW1lbnQgfCBIVE1MVGV4dEFyZWFFbGVtZW50O1xuXG5leHBvcnQgY2xhc3MgTmd4Rm9ybVN1cHBvcnQge1xuICAvKiogTWFwcyB0aGUgaW50ZXJuYWwgaWRzIG9mIHRoZSBhbm5vdGF0aW9ucyBvZiBwZGYuanMgdG8gdGhlaXIgZmllbGQgbmFtZSAqL1xuICBwcml2YXRlIGZvcm1JZFRvRnVsbEZpZWxkTmFtZTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuXG4gIHByaXZhdGUgZm9ybUlkVG9GaWVsZDogeyBba2V5OiBzdHJpbmddOiBIdG1sRm9ybUVsZW1lbnQgfSA9IHt9O1xuXG4gIHByaXZhdGUgcmFkaW9CdXR0b25zOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PEhUTUxJbnB1dEVsZW1lbnQ+IH0gPSB7fTtcblxuICBwdWJsaWMgZm9ybURhdGE6IEZvcm1EYXRhVHlwZSA9IHt9O1xuXG4gIHB1YmxpYyBpbml0aWFsRm9ybURhdGFTdG9yZWRJblRoZVBERjogRm9ybURhdGFUeXBlID0ge307XG5cbiAgcHVibGljIGZvcm1EYXRhQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxGb3JtRGF0YVR5cGU+KCk7XG5cbiAgcHJpdmF0ZSBQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uIHwgdW5kZWZpbmVkO1xuXG4gIHB1YmxpYyByZXNldCgpIHtcbiAgICB0aGlzLmZvcm1EYXRhID0ge307XG4gICAgdGhpcy5mb3JtSWRUb0Z1bGxGaWVsZE5hbWUgPSB7fTtcbiAgfVxuXG4gIHB1YmxpYyByZWdpc3RlckZvcm1TdXBwb3J0V2l0aFBkZmpzKFBERlZpZXdlckFwcGxpY2F0aW9uOiBJUERGVmlld2VyQXBwbGljYXRpb24pOiB2b2lkIHtcbiAgICAoZ2xvYmFsVGhpcyBhcyBhbnkpLmdldEZvcm1WYWx1ZUZyb21Bbmd1bGFyID0gKGtleTogc3RyaW5nKSA9PiB0aGlzLmdldEZvcm1WYWx1ZUZyb21Bbmd1bGFyKGtleSk7XG4gICAgKGdsb2JhbFRoaXMgYXMgYW55KS51cGRhdGVBbmd1bGFyRm9ybVZhbHVlID0gKGtleTogc3RyaW5nIHwgSFRNTElucHV0RWxlbWVudCB8IEhUTUxTZWxlY3RFbGVtZW50IHwgSFRNTFRleHRBcmVhRWxlbWVudCwgdmFsdWU6IHsgdmFsdWU6IHN0cmluZyB9KSA9PlxuICAgICAgdGhpcy51cGRhdGVBbmd1bGFyRm9ybVZhbHVlQ2FsbGVkQnlQZGZqcyhrZXksIHZhbHVlKTtcbiAgICAoZ2xvYmFsVGhpcyBhcyBhbnkpLnJlZ2lzdGVyQWNyb2Zvcm1GaWVsZCA9IChcbiAgICAgIGlkOiBzdHJpbmcsXG4gICAgICBlbGVtZW50OiBIdG1sRm9ybUVsZW1lbnQsXG4gICAgICB2YWx1ZTogc3RyaW5nIHwgQXJyYXk8c3RyaW5nPixcbiAgICAgIHJhZGlvQnV0dG9uVmFsdWVOYW1lOiBzdHJpbmcsXG4gICAgICBpbml0aWFsVmFsdWVGcm9tUERGOiBzdHJpbmdcbiAgICApID0+IHRoaXMucmVnaXN0ZXJBY3JvZm9ybUZpZWxkKGlkLCBlbGVtZW50LCB2YWx1ZSwgcmFkaW9CdXR0b25WYWx1ZU5hbWUsIGluaXRpYWxWYWx1ZUZyb21QREYpO1xuXG4gICAgKGdsb2JhbFRoaXMgYXMgYW55KS5yZWdpc3RlclhGQUZpZWxkID0gKGVsZW1lbnQ6IEh0bWxGb3JtRWxlbWVudCwgdmFsdWU6IHsgdmFsdWU6IHN0cmluZyB9LCBpbml0aWFsVmFsdWVGcm9tUERGOiBzdHJpbmcpID0+XG4gICAgICB0aGlzLnJlZ2lzdGVyWEZBRmllbGQoZWxlbWVudCwgdmFsdWUsIGluaXRpYWxWYWx1ZUZyb21QREYpO1xuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3RlckFjcm9mb3JtRmllbGQoXG4gICAgaWQ6IHN0cmluZyxcbiAgICBlbGVtZW50OiBIdG1sRm9ybUVsZW1lbnQsXG4gICAgdmFsdWU6IG51bGwgfCBzdHJpbmcgfCBBcnJheTxzdHJpbmc+LFxuICAgIHJhZGlvQnV0dG9uVmFsdWVOYW1lOiBzdHJpbmcsXG4gICAgaW5pdGlhbEZvcm1WYWx1ZUZyb21QREY6IHN0cmluZ1xuICApOiB2b2lkIHtcbiAgICBjb25zdCBmaWVsZE5hbWUgPSBlbGVtZW50Lm5hbWU7XG4gICAgdGhpcy5mb3JtSWRUb0ZpZWxkW2lkXSA9IGVsZW1lbnQ7XG4gICAgdGhpcy5mb3JtSWRUb0Z1bGxGaWVsZE5hbWVbaWRdID0gZmllbGROYW1lO1xuICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiBlbGVtZW50LnR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgIGNvbnN0IGdyb3VwTmFtZSA9IGZpZWxkTmFtZTtcbiAgICAgIHRoaXMuZm9ybUlkVG9GdWxsRmllbGROYW1lW2lkXSA9IGdyb3VwTmFtZTtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICB0aGlzLmZvcm1EYXRhW2dyb3VwTmFtZV0gPSByYWRpb0J1dHRvblZhbHVlTmFtZTtcbiAgICAgICAgdGhpcy5pbml0aWFsRm9ybURhdGFTdG9yZWRJblRoZVBERltncm91cE5hbWVdID0gaW5pdGlhbEZvcm1WYWx1ZUZyb21QREY7XG4gICAgICB9XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZXhwb3J0VmFsdWUnLCByYWRpb0J1dHRvblZhbHVlTmFtZSk7XG4gICAgICBpZiAoIXRoaXMucmFkaW9CdXR0b25zW2dyb3VwTmFtZV0pIHtcbiAgICAgICAgdGhpcy5yYWRpb0J1dHRvbnNbZ3JvdXBOYW1lXSA9IFtdO1xuICAgICAgfVxuICAgICAgdGhpcy5yYWRpb0J1dHRvbnNbZ3JvdXBOYW1lXS5wdXNoKGVsZW1lbnQpO1xuICAgIH0gZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxTZWxlY3RFbGVtZW50KSB7XG4gICAgICB0aGlzLmZvcm1EYXRhW2ZpZWxkTmFtZV0gPSB0aGlzLmdldFZhbHVlT2ZBU2VsZWN0RmllbGQoZWxlbWVudCk7XG4gICAgICB0aGlzLmluaXRpYWxGb3JtRGF0YVN0b3JlZEluVGhlUERGW2ZpZWxkTmFtZV0gPSBpbml0aWFsRm9ybVZhbHVlRnJvbVBERjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5mb3JtRGF0YVtmaWVsZE5hbWVdID0gdmFsdWU7XG4gICAgICB9XG4gICAgICB0aGlzLmluaXRpYWxGb3JtRGF0YVN0b3JlZEluVGhlUERGW2ZpZWxkTmFtZV0gPSBpbml0aWFsRm9ybVZhbHVlRnJvbVBERjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyWEZBRmllbGQoZWxlbWVudDogSFRNTEVsZW1lbnQsIHZhbHVlOiB7IHZhbHVlOiBzdHJpbmcgfSwgaW5pdGlhbEZvcm1WYWx1ZUZyb21QREY6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGZ1bGxGaWVsZE5hbWUgPSB0aGlzLmZpbmRGdWxsWEZBTmFtZShlbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgJiYgZWxlbWVudC50eXBlID09PSAncmFkaW8nKSB7XG4gICAgICBjb25zdCBpZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdmaWVsZGlkJykgPz8gJyc7XG4gICAgICAvLyByZW1vdmUgdGhlIHhmYSBuYW1lIG9mIHRoZSByYWRpbyBidXR0b24gaXRzZWxmIGZvcm0gdGhlIGZpZWxkIG5hbWUsXG4gICAgICAvLyBiZWNhdXNlIHRoZSBmaWVsZCBuYW1lIHJlZmVycyB0byB0aGUgZW50aXJlIGdyb3VwIG9mIHJlbGF0YXRlZCByYWRpbyBidXR0b25zXG4gICAgICBjb25zdCBncm91cE5hbWUgPSBmdWxsRmllbGROYW1lLnN1YnN0cmluZygwLCBmdWxsRmllbGROYW1lLmxhc3RJbmRleE9mKCcuJykpO1xuICAgICAgdGhpcy5mb3JtSWRUb0Z1bGxGaWVsZE5hbWVbaWRdID0gZ3JvdXBOYW1lO1xuICAgICAgdGhpcy5mb3JtRGF0YVtncm91cE5hbWVdID0gdmFsdWU/LnZhbHVlO1xuICAgICAgdGhpcy5pbml0aWFsRm9ybURhdGFTdG9yZWRJblRoZVBERltncm91cE5hbWVdID0gaW5pdGlhbEZvcm1WYWx1ZUZyb21QREY7XG5cbiAgICAgIGlmICghdGhpcy5yYWRpb0J1dHRvbnNbZ3JvdXBOYW1lXSkge1xuICAgICAgICB0aGlzLnJhZGlvQnV0dG9uc1tncm91cE5hbWVdID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLnJhZGlvQnV0dG9uc1tncm91cE5hbWVdLnB1c2goZWxlbWVudCk7XG4gICAgfSBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgY29uc3QgaWQgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZmllbGRpZCcpID8/ICcnO1xuICAgICAgdGhpcy5mb3JtSWRUb0ZpZWxkW2lkXSA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLmZvcm1JZFRvRnVsbEZpZWxkTmFtZVtpZF0gPSBmdWxsRmllbGROYW1lO1xuICAgICAgdGhpcy5mb3JtRGF0YVtmdWxsRmllbGROYW1lXSA9IHZhbHVlPy52YWx1ZTtcbiAgICAgIHRoaXMuaW5pdGlhbEZvcm1EYXRhU3RvcmVkSW5UaGVQREZbZnVsbEZpZWxkTmFtZV0gPSBpbml0aWFsRm9ybVZhbHVlRnJvbVBERjtcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MU2VsZWN0RWxlbWVudCkge1xuICAgICAgY29uc3QgaWQgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZmllbGRpZCcpID8/ICcnO1xuICAgICAgdGhpcy5mb3JtSWRUb0ZpZWxkW2lkXSA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLmZvcm1JZFRvRnVsbEZpZWxkTmFtZVtpZF0gPSBmdWxsRmllbGROYW1lO1xuICAgICAgdGhpcy5mb3JtRGF0YVtmdWxsRmllbGROYW1lXSA9IHZhbHVlPy52YWx1ZTtcbiAgICAgIHRoaXMuaW5pdGlhbEZvcm1EYXRhU3RvcmVkSW5UaGVQREZbZnVsbEZpZWxkTmFtZV0gPSBpbml0aWFsRm9ybVZhbHVlRnJvbVBERjtcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50KSB7XG4gICAgICBjb25zdCBpZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdmaWVsZGlkJykgPz8gJyc7XG4gICAgICB0aGlzLmZvcm1JZFRvRmllbGRbaWRdID0gZWxlbWVudDtcbiAgICAgIHRoaXMuZm9ybUlkVG9GdWxsRmllbGROYW1lW2lkXSA9IGZ1bGxGaWVsZE5hbWU7XG4gICAgICB0aGlzLmZvcm1EYXRhW2Z1bGxGaWVsZE5hbWVdID0gdmFsdWU/LnZhbHVlO1xuICAgICAgdGhpcy5pbml0aWFsRm9ybURhdGFTdG9yZWRJblRoZVBERltmdWxsRmllbGROYW1lXSA9IGluaXRpYWxGb3JtVmFsdWVGcm9tUERGO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQ291bGRuJ3QgcmVnaXN0ZXIgYW4gWEZBIGZvcm0gZmllbGRcIiwgZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRWYWx1ZU9mQVNlbGVjdEZpZWxkKHNlbGVjdEVsZW1lbnQ6IEhUTUxTZWxlY3RFbGVtZW50KTogbnVsbCB8IHN0cmluZyB8IEFycmF5PHN0cmluZz4ge1xuICAgIGNvbnN0IHsgb3B0aW9ucywgbXVsdGlwbGUgfSA9IHNlbGVjdEVsZW1lbnQ7XG4gICAgaWYgKCFtdWx0aXBsZSkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuc2VsZWN0ZWRJbmRleCA9PT0gLTEgPyBudWxsIDogb3B0aW9uc1tvcHRpb25zLnNlbGVjdGVkSW5kZXhdWyd2YWx1ZSddO1xuICAgIH1cbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKG9wdGlvbnMsIChvcHRpb24pID0+IG9wdGlvbi5zZWxlY3RlZCkubWFwKChvcHRpb24pID0+IG9wdGlvblsndmFsdWUnXSk7XG4gIH1cblxuICBwcml2YXRlIGdldEZvcm1WYWx1ZUZyb21Bbmd1bGFyKGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nKTogT2JqZWN0IHtcbiAgICBsZXQga2V5OiBzdHJpbmc7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgY29uc3QgZmllbGROYW1lID0gdGhpcy5maW5kWEZBTmFtZShlbGVtZW50KTtcbiAgICAgIGlmIChmaWVsZE5hbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuZm9ybURhdGEuaGFzT3duUHJvcGVydHkoZmllbGROYW1lKSkge1xuICAgICAgICAgIGtleSA9IGZpZWxkTmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBrZXkgPSB0aGlzLmZpbmRGdWxsWEZBTmFtZShlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkbid0IGZpbmQgdGhlIGZpZWxkIG5hbWUgb3IgWEZBIG5hbWUgb2YgdGhlIGZvcm0gZmllbGRcIiwgZWxlbWVudCk7XG4gICAgICAgIHJldHVybiB7IHZhbHVlOiBudWxsIH07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleSA9IGVsZW1lbnQ7XG4gICAgfVxuICAgIHJldHVybiB7IHZhbHVlOiB0aGlzLmZvcm1EYXRhW2tleV0gfTtcbiAgfVxuXG4gIHByaXZhdGUgZmluZFhGQU5hbWUoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBzdHJpbmcge1xuICAgIGxldCBwYXJlbnRFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQgPSBlbGVtZW50O1xuICAgIHdoaWxlICghcGFyZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3hmYW5hbWUnKSAmJiBwYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQpIHtcbiAgICAgIHBhcmVudEVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiBlbGVtZW50LnR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgIGRvIHtcbiAgICAgICAgcGFyZW50RWxlbWVudCA9IHBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ7XG4gICAgICB9IHdoaWxlICghcGFyZW50RWxlbWVudD8uZ2V0QXR0cmlidXRlKCd4ZmFuYW1lJykgJiYgcGFyZW50RWxlbWVudCk7XG4gICAgfVxuICAgIGxldCBmaWVsZE5hbWUgPSBwYXJlbnRFbGVtZW50Py5nZXRBdHRyaWJ1dGUoJ3hmYW5hbWUnKTtcbiAgICBpZiAoIWZpZWxkTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCB0aGUgeGZhbmFtZSBvZiB0aGUgZmllbGRcIik7XG4gICAgfVxuICAgIHJldHVybiBmaWVsZE5hbWU7XG4gIH1cblxuICBwcml2YXRlIGZpbmRGdWxsWEZBTmFtZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IHN0cmluZyB7XG4gICAgbGV0IHBhcmVudEVsZW1lbnQgPSBlbGVtZW50O1xuICAgIGxldCBmaWVsZE5hbWUgPSAnJztcbiAgICB3aGlsZSAocGFyZW50RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIHBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgICAgY29uc3QgeGZhTmFtZSA9IHBhcmVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCd4ZmFuYW1lJyk7XG4gICAgICBpZiAoeGZhTmFtZSkge1xuICAgICAgICBmaWVsZE5hbWUgPSB4ZmFOYW1lICsgJy4nICsgZmllbGROYW1lO1xuICAgICAgfVxuICAgICAgcGFyZW50RWxlbWVudCA9IHBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICB9XG4gICAgaWYgKCFmaWVsZE5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgdGhlIHhmYW5hbWUgb2YgdGhlIGZpZWxkXCIpO1xuICAgIH1cbiAgICBmaWVsZE5hbWUgPSBmaWVsZE5hbWUuc3Vic3RyaW5nKDAsIGZpZWxkTmFtZS5sZW5ndGggLSAxKTtcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgJiYgZWxlbWVudC50eXBlID09PSAncmFkaW8nKSB7XG4gICAgICAvLyBpZ25vcmUgdGhlIGxhc3QgcGFydCBvZiB0aGUgeGZhTmFtZSBiZWNhdXNlIGl0J3MgYWN0dWFsbHkgdGhlIHZhbHVlIG9mIHRoZSBmaWVsZFxuICAgICAgcmV0dXJuIGZpZWxkTmFtZS5zdWJzdHJpbmcoMCwgZmllbGROYW1lLmxhc3RJbmRleE9mKCcuJykpO1xuICAgIH1cbiAgICByZXR1cm4gZmllbGROYW1lO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVBbmd1bGFyRm9ybVZhbHVlQ2FsbGVkQnlQZGZqcyhrZXk6IHN0cmluZyB8IEhUTUxTZWxlY3RFbGVtZW50IHwgSFRNTElucHV0RWxlbWVudCB8IEhUTUxUZXh0QXJlYUVsZW1lbnQsIHZhbHVlOiB7IHZhbHVlOiBzdHJpbmcgfSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IHt9O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgYWNyb0Zvcm1LZXkgPSB0aGlzLmZvcm1JZFRvRnVsbEZpZWxkTmFtZVtrZXldO1xuICAgICAgY29uc3QgZnVsbEtleSA9IGFjcm9Gb3JtS2V5ID8/IE9iamVjdC52YWx1ZXModGhpcy5mb3JtSWRUb0Z1bGxGaWVsZE5hbWUpLmZpbmQoKGspID0+IGsgPT09IGtleSB8fCBrLmVuZHNXaXRoKCcuJyArIGtleSkpO1xuICAgICAgaWYgKGZ1bGxLZXkpIHtcbiAgICAgICAgY29uc3QgZmllbGQgPSB0aGlzLmZvcm1JZFRvRmllbGRba2V5XTtcbiAgICAgICAgbGV0IGNoYW5nZSA9IHRoaXMuZG9VcGRhdGVBbmd1bGFyRm9ybVZhbHVlKGZpZWxkLCB2YWx1ZSwgZnVsbEtleSk7XG4gICAgICAgIGlmIChjaGFuZ2UpIHtcbiAgICAgICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB0aGlzLmZvcm1EYXRhQ2hhbmdlLmVtaXQodGhpcy5mb3JtRGF0YSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiQ291bGRuJ3QgZmluZCB0aGUgZmllbGQgd2l0aCB0aGUgbmFtZSBcIiArIGtleSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcbiAgICAgIGNvbnN0IHNob3J0RmllbGROYW1lID0gdGhpcy5maW5kWEZBTmFtZShrZXkpO1xuICAgICAgaWYgKHRoaXMuZm9ybURhdGEuaGFzT3duUHJvcGVydHkoc2hvcnRGaWVsZE5hbWUpKSB7XG4gICAgICAgIGNoYW5nZSA9IHRoaXMuZG9VcGRhdGVBbmd1bGFyRm9ybVZhbHVlKGtleSwgdmFsdWUsIHNob3J0RmllbGROYW1lKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZ1bGxGaWVsZE5hbWUgPSB0aGlzLmZpbmRGdWxsWEZBTmFtZShrZXkpO1xuICAgICAgaWYgKGZ1bGxGaWVsZE5hbWUgIT09IHNob3J0RmllbGROYW1lKSB7XG4gICAgICAgIGNoYW5nZSB8fD0gdGhpcy5kb1VwZGF0ZUFuZ3VsYXJGb3JtVmFsdWUoa2V5LCB2YWx1ZSwgZnVsbEZpZWxkTmFtZSk7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHRoaXMuZm9ybURhdGFDaGFuZ2UuZW1pdCh0aGlzLmZvcm1EYXRhKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkb1VwZGF0ZUFuZ3VsYXJGb3JtVmFsdWUoZmllbGQ6IEh0bWxGb3JtRWxlbWVudCwgdmFsdWU6IHsgdmFsdWU6IHN0cmluZyB9LCBmdWxsS2V5OiBzdHJpbmcpIHtcbiAgICBsZXQgY2hhbmdlID0gZmFsc2U7XG4gICAgaWYgKGZpZWxkIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiBmaWVsZC50eXBlID09PSAnY2hlY2tib3gnKSB7XG4gICAgICBjb25zdCBleHBvcnRWYWx1ZSA9IGZpZWxkLmdldEF0dHJpYnV0ZSgnZXhwb3J0dmFsdWUnKTtcbiAgICAgIGlmIChleHBvcnRWYWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUudmFsdWUpIHtcbiAgICAgICAgICBpZiAodGhpcy5mb3JtRGF0YVtmdWxsS2V5XSAhPT0gZXhwb3J0VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybURhdGFbZnVsbEtleV0gPSBleHBvcnRWYWx1ZTtcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLmZvcm1EYXRhW2Z1bGxLZXldICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5mb3JtRGF0YVtmdWxsS2V5XSA9IGZhbHNlO1xuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5mb3JtRGF0YVtmdWxsS2V5XSAhPT0gdmFsdWUudmFsdWUpIHtcbiAgICAgICAgdGhpcy5mb3JtRGF0YVtmdWxsS2V5XSA9IHZhbHVlLnZhbHVlO1xuICAgICAgICBjaGFuZ2UgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZmllbGQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50ICYmIGZpZWxkLnR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgIGNvbnN0IGV4cG9ydFZhbHVlID0gZmllbGQuZ2V0QXR0cmlidXRlKCdleHBvcnR2YWx1ZScpID8/IGZpZWxkLmdldEF0dHJpYnV0ZSgneGZhb24nKTtcbiAgICAgIGlmICh2YWx1ZS52YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5mb3JtRGF0YVtmdWxsS2V5XSAhPT0gZXhwb3J0VmFsdWUpIHtcbiAgICAgICAgICB0aGlzLmZvcm1EYXRhW2Z1bGxLZXldID0gZXhwb3J0VmFsdWU7XG4gICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5mb3JtRGF0YVtmdWxsS2V5XSAhPT0gdmFsdWUudmFsdWUpIHtcbiAgICAgIHRoaXMuZm9ybURhdGFbZnVsbEtleV0gPSB2YWx1ZS52YWx1ZTtcbiAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBjaGFuZ2U7XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlRm9ybUZpZWxkc0luUGRmQ2FsbGVkQnlOZ09uQ2hhbmdlcyhwcmV2aW91c0Zvcm1EYXRhOiBPYmplY3QpIHtcbiAgICBpZiAoIXRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZkRvY3VtZW50Py5hbm5vdGF0aW9uU3RvcmFnZSkge1xuICAgICAgLy8gbmdPbkNoYW5nZXMgY2FsbHMgdGhpcyBtZXRob2QgdG9vIGVhcmx5IC0gc28ganVzdCBpZ25vcmUgaXRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmZvcm1EYXRhKSB7XG4gICAgICBpZiAodGhpcy5mb3JtRGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5mb3JtRGF0YVtrZXldO1xuICAgICAgICBpZiAobmV3VmFsdWUgIT09IHByZXZpb3VzRm9ybURhdGFba2V5XSkge1xuICAgICAgICAgIHRoaXMuc2V0RmllbGRWYWx1ZUFuZFVwZGF0ZUFubm90YXRpb25TdG9yYWdlKGtleSwgbmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gcHJldmlvdXNGb3JtRGF0YSkge1xuICAgICAgaWYgKHByZXZpb3VzRm9ybURhdGEuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBwcmV2aW91c0Zvcm1EYXRhW2tleV0pIHtcbiAgICAgICAgbGV0IGhhc1ByZXZpb3VzVmFsdWUgPSB0aGlzLmZvcm1EYXRhLmhhc093blByb3BlcnR5KGtleSk7XG4gICAgICAgIGlmICghaGFzUHJldmlvdXNWYWx1ZSkge1xuICAgICAgICAgIGNvbnN0IGZ1bGxLZXkgPSBPYmplY3Qua2V5cyh0aGlzLmZvcm1EYXRhKS5maW5kKChrKSA9PiBrID09PSBrZXkgfHwgay5lbmRzV2l0aCgnLicgKyBrZXkpKTtcbiAgICAgICAgICBpZiAoZnVsbEtleSkge1xuICAgICAgICAgICAgaGFzUHJldmlvdXNWYWx1ZSA9IHRoaXMuZm9ybURhdGEuaGFzT3duUHJvcGVydHkoZnVsbEtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFoYXNQcmV2aW91c1ZhbHVlKSB7XG4gICAgICAgICAgdGhpcy5zZXRGaWVsZFZhbHVlQW5kVXBkYXRlQW5ub3RhdGlvblN0b3JhZ2Uoa2V5LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0RmllbGRWYWx1ZUFuZFVwZGF0ZUFubm90YXRpb25TdG9yYWdlKGtleTogc3RyaW5nLCBuZXdWYWx1ZTogYW55KSB7XG4gICAgY29uc3QgcmFkaW9zID0gdGhpcy5maW5kUmFkaW9CdXR0b25Hcm91cChrZXkpO1xuICAgIGlmIChyYWRpb3MpIHtcbiAgICAgIHJhZGlvcy5mb3JFYWNoKChyKSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZVZhbHVlID0gci5nZXRBdHRyaWJ1dGUoJ2V4cG9ydFZhbHVlJykgPz8gci5nZXRBdHRyaWJ1dGUoJ3hmYW9uJyk7XG4gICAgICAgIHIuY2hlY2tlZCA9IGFjdGl2ZVZhbHVlID09PSBuZXdWYWx1ZTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgdXBkYXRlRnJvbUFuZ3VsYXIgPSBuZXcgQ3VzdG9tRXZlbnQoJ3VwZGF0ZUZyb21Bbmd1bGFyJywge1xuICAgICAgICBkZXRhaWw6IG5ld1ZhbHVlLFxuICAgICAgfSk7XG4gICAgICByYWRpb3NbMF0uZGlzcGF0Y2hFdmVudCh1cGRhdGVGcm9tQW5ndWxhcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZpZWxkSWQgPSB0aGlzLmZpbmRGb3JtSWRGcm9tRmllbGROYW1lKGtleSk7XG4gICAgICBpZiAoZmllbGRJZCkge1xuICAgICAgICBjb25zdCBodG1sRmllbGQgPSB0aGlzLmZvcm1JZFRvRmllbGRbZmllbGRJZF07XG5cbiAgICAgICAgaWYgKGh0bWxGaWVsZCkge1xuICAgICAgICAgIGlmIChodG1sRmllbGQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50ICYmIGh0bWxGaWVsZC50eXBlID09PSAnY2hlY2tib3gnKSB7XG4gICAgICAgICAgICBsZXQgYWN0aXZlVmFsdWUgPSBodG1sRmllbGQuZ2V0QXR0cmlidXRlKCd4ZmFvbicpID8/IGh0bWxGaWVsZC5nZXRBdHRyaWJ1dGUoJ2V4cG9ydHZhbHVlJykgPz8gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChuZXdWYWx1ZSA9PT0gdHJ1ZSB8fCBuZXdWYWx1ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgYWN0aXZlVmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbEZpZWxkLmNoZWNrZWQgPSBhY3RpdmVWYWx1ZSA9PT0gbmV3VmFsdWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChodG1sRmllbGQgaW5zdGFuY2VvZiBIVE1MU2VsZWN0RWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZVNlbGVjdEZpZWxkKGh0bWxGaWVsZCwgbmV3VmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0ZXh0YXJlYXMgYW5kIGlucHV0IGZpZWxkc1xuICAgICAgICAgICAgaHRtbEZpZWxkLnZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHVwZGF0ZUZyb21Bbmd1bGFyID0gbmV3IEN1c3RvbUV2ZW50KCd1cGRhdGVGcm9tQW5ndWxhcicsIHtcbiAgICAgICAgICAgIGRldGFpbDogbmV3VmFsdWUsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaHRtbEZpZWxkLmRpc3BhdGNoRXZlbnQodXBkYXRlRnJvbUFuZ3VsYXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb3VsZG4ndCBzZXQgdGhlIHZhbHVlIG9mIHRoZSBmaWVsZFwiLCBrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwb3B1bGF0ZVNlbGVjdEZpZWxkKGh0bWxGaWVsZDogSFRNTFNlbGVjdEVsZW1lbnQsIG5ld1ZhbHVlOiBhbnkpIHtcbiAgICBpZiAoaHRtbEZpZWxkLm11bHRpcGxlKSB7XG4gICAgICBjb25zdCB7IG9wdGlvbnMgfSA9IGh0bWxGaWVsZDtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlQXJyYXkgPSBuZXdWYWx1ZSBhcyBBcnJheTxzdHJpbmc+O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IG9wdGlvbnMuaXRlbShpKTtcbiAgICAgICAgaWYgKG9wdGlvbikge1xuICAgICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IG5ld1ZhbHVlQXJyYXkuc29tZSgobykgPT4gbyA9PT0gb3B0aW9uLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBodG1sRmllbGQudmFsdWUgPSBuZXdWYWx1ZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbmRGb3JtSWRGcm9tRmllbGROYW1lKGZpZWxkTmFtZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoT2JqZWN0LmVudHJpZXModGhpcy5mb3JtSWRUb0Z1bGxGaWVsZE5hbWUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gc29tZXRpbWVzLCBuZ09uQ2hhbmdlcygpIGlzIGNhbGxlZCBiZWZvcmUgaW5pdGlhbGl6aW5nIHRoZSBQREYgZmlsZVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgbWF0Y2hpbmdFbnRyaWVzID0gT2JqZWN0LmVudHJpZXModGhpcy5mb3JtSWRUb0Z1bGxGaWVsZE5hbWUpLmZpbHRlcigoZW50cnkpID0+IGVudHJ5WzFdID09PSBmaWVsZE5hbWUgfHwgZW50cnlbMV0uZW5kc1dpdGgoJy4nICsgZmllbGROYW1lKSk7XG4gICAgaWYgKG1hdGNoaW5nRW50cmllcy5sZW5ndGggPiAxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgYE1vcmUgdGhhbiBvbmUgZmllbGQgbmFtZSBtYXRjaGVzIHRoZSBmaWVsZCBuYW1lICR7ZmllbGROYW1lfS4gUGxlYXNlIHVzZSB0aGUgb25lIG9mIHRoZXNlIHF1YWxpZmllZCBmaWVsZCBuYW1lczpgLFxuICAgICAgICBtYXRjaGluZ0VudHJpZXMubWFwKChmKSA9PiBmWzFdKVxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAnbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIgdXNlcyB0aGUgZmlyc3QgbWF0Y2hpbmcgZmllbGQgKHdoaWNoIG1heSBvciBtYXkgbm90IGJlIHRoZSB0b3Btb3N0IGZpZWxkIG9uIHlvdXIgUERGIGZvcm0pOiAnICsgbWF0Y2hpbmdFbnRyaWVzWzBdWzBdXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAobWF0Y2hpbmdFbnRyaWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc29sZS5sb2coXCJDb3VsZG4ndCBmaW5kIHRoZSBmaWVsZCBcIiArIGZpZWxkTmFtZSk7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hpbmdFbnRyaWVzWzBdWzBdO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUmFkaW9CdXR0b25Hcm91cChmaWVsZE5hbWU6IHN0cmluZyk6IEFycmF5PEhUTUxJbnB1dEVsZW1lbnQ+IHwgbnVsbCB7XG4gICAgY29uc3QgbWF0Y2hpbmdFbnRyaWVzID0gT2JqZWN0LmVudHJpZXModGhpcy5yYWRpb0J1dHRvbnMpLmZpbHRlcigoZW50cnkpID0+IGVudHJ5WzBdLmVuZHNXaXRoKCcuJyArIGZpZWxkTmFtZSkgfHwgZW50cnlbMF0gPT09IGZpZWxkTmFtZSk7XG4gICAgaWYgKG1hdGNoaW5nRW50cmllcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAobWF0Y2hpbmdFbnRyaWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAnTW9yZSB0aGFuIG9uZSByYWRpbyBidXR0b24gZ3JvdXAgbmFtZSBtYXRjaGVzIHRoaXMgbmFtZS4gUGxlYXNlIHVzZSB0aGUgcXVhbGlmaWVkIGZpZWxkIG5hbWUnLFxuICAgICAgICBtYXRjaGluZ0VudHJpZXMubWFwKChyYWRpbykgPT4gcmFkaW9bMF0pXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coJ25neC1leHRlbmRlZC1wZGYtdmlld2VyIHVzZXMgdGhlIGZpcnN0IG1hdGNoaW5nIGZpZWxkICh3aGljaCBtYXkgbm90IGJlIHRoZSB0b3Btb3N0IGZpZWxkIG9uIHlvdXIgUERGIGZvcm0pOiAnICsgbWF0Y2hpbmdFbnRyaWVzWzBdWzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoaW5nRW50cmllc1swXVsxXTtcbiAgfVxufVxuIl19