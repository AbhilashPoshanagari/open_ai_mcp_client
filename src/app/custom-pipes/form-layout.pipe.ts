// form-layout.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { FormLayout, Layout } from '../components/models/message.model';

@Pipe({
  name: 'filterForms',
  standalone: true
})
export class FilterFormsPipe implements PipeTransform {
  transform(layouts: Layout[] | null | undefined): FormLayout[] {
    console.log('🔍 FilterFormsPipe - Input layouts:', layouts);
    
    if (!layouts || !Array.isArray(layouts)) {
      console.log('❌ FilterFormsPipe - No layouts or not array');
      return [];
    }
    
    const formLayouts = layouts.filter((layout): layout is FormLayout => 
      layout && layout.type === 'form' && layout.data
    );
    
    console.log('✅ FilterFormsPipe - Found form layouts:', formLayouts);
    return formLayouts;
  }
}

@Pipe({
  name: 'isValidFormLayout',
  standalone: true
})
export class IsValidFormLayoutPipe implements PipeTransform {
  transform(layout: any): boolean {
    const formLayout = layout as FormLayout;
    console.log('🔍 IsValidFormLayoutPipe - Checking layout:', formLayout);
    
    const isValid = formLayout && 
           formLayout.type === 'form' && 
           formLayout.data && 
           formLayout.data.schema;
    
    console.log('✅ IsValidFormLayoutPipe - Layout valid:', isValid);
    
    if (!isValid) {
      console.log('❌ IsValidFormLayoutPipe - Invalid because:', {
        hasLayout: !!formLayout,
        correctType: formLayout?.type === 'form',
        hasData: !!formLayout?.data,
        hasSchema: !!formLayout?.data?.schema
      });
    }
    
    return isValid;
  }
}

@Pipe({
  name: 'getFormSchema',
  standalone: true
})
export class GetFormSchemaPipe implements PipeTransform {
  transform(layout: any): any {
    const formLayout = layout as FormLayout;
    console.log('🔍 GetFormSchemaPipe - Layout data:', formLayout?.data);
    console.log('🔍 GetFormSchemaPipe - Schema:', formLayout?.data?.schema);
    
    return formLayout?.data?.schema;
  }

  private sanitizeFieldName(name: string): string {
    return name.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
  }
}