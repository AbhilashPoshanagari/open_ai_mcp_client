import { Component, Input, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
@Component({
  selector: 'app-chatbot',
  imports: [FormsModule, CommonModule, MarkdownModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
  standalone: true
})
export class ChatbotComponent implements AfterViewInit, OnDestroy{
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;
  // @Input() messages: any[] = [];
  private _messages: any[] = [];
  @Input() set messages(value: any[]) {
    this._messages = value;
    // Scroll only if user hasn't scrolled up
    if (this.shouldScrollToBottom) {
      requestAnimationFrame(() => this.scrollToBottom());
    }
  }
  get messages(): any[] {
    return this._messages;
  }
  private shouldScrollToBottom = true;
  private mutationObserver: MutationObserver | null = null;
  constructor() {
    console.log("chat messages : ", this.messages)
  }

   // === Lifecycle ===
  ngAfterViewInit() {
    if (!this.chatMessagesContainer?.nativeElement) return;

    this.mutationObserver = new MutationObserver(() => {
      if (this.shouldScrollToBottom) {
        requestAnimationFrame(() => this.scrollToBottom());
      }
    });

    this.mutationObserver.observe(this.chatMessagesContainer.nativeElement, {
      childList: true,
      subtree: true
    });
  }

ngOnDestroy() {
    this.mutationObserver?.disconnect();
  }

 // === Auto Scroll ===
  public scrollToBottom(force: boolean = false): void {
    const element = this.chatMessagesContainer?.nativeElement;
    if (!element) return;

    if (force) this.shouldScrollToBottom = true;

    if (this.shouldScrollToBottom) {
      element.scrollTop = element.scrollHeight;
    }
  }

// Call from (scroll) in template
  onChatScroll(): void {
    const element = this.chatMessagesContainer?.nativeElement;
    if (!element) return;

    const tolerance = 20;

    const isBottom =
      Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) <= tolerance;

    this.shouldScrollToBottom = isBottom;
  }

    // Check if the layout is a table layout
  isTableLayout(layouts: Array<any>): boolean {
    for(const layout of layouts){
      console.log("Layout key check: ", layout);
      if(layout.layout_name === 'table' && Array.isArray(layout.tables)){
        return true;
      }
    }
    return false
  }

  // Get tables array from layout
  getTables(layouts: any): any[] {
    for(const layout of layouts){
      if(layout.layout_name === 'table'){
        return layout.tables || [];
      }
    }
    return [];
  }

    // Check if the layout is a table layout
  isButtonLayout(layouts: Array<any>): boolean {
    for(const layout of layouts){
      console.log("Layout key check: ", layout);
      if(layout.layout_name === 'button' && layout.link){
        return true;
      }
    }
    return false
  }

  // Get tables array from layout
  getLinks(layouts: any): string | boolean {
    for(const layout of layouts){
      if(layout.layout_name === 'button'){
        return layout.link || false;
      }
    }
    return false;
  }

  // Check if table has a valid name
  hasValidTableName(table: any): boolean {
    return table && 
           table.table_name && 
           typeof table.table_name === 'string' && 
           table.table_name.trim().length > 0;
  }

  // Check if table has valid structure
  hasValidTableStructure(table: any): boolean {
    return table && 
           Array.isArray(table.column_names) && 
           table.column_names.length > 0 &&
           Array.isArray(table.data) &&
           table.data.every((row: any) => Array.isArray(row));
  }

  // Get table headers
  getTableHeaders(table: any): string[] {
    return table.column_names || [];
  }

  // Get table data
  getTableData(table: any): any[][] {
    return table.data || [];
  }

  // Handle both array of buttons and single button object
  getButtons(layouts: any): any[] {
    for(const layout of layouts){
      if (Array.isArray(layout.buttons)) {
        return layout.buttons;
      } else if (this.isSingleButton(layout)) {
        return [layout]; // Wrap single button in array
      }
    }
    return [];
  }

  // Check if layout itself is a single button (for backward compatibility)
  private isSingleButton(layout: any): boolean {
    return layout && 
           layout.layout_name === 'button' && 
           layout.link && 
           layout.title;
  }

  hasValidButtonStructure(button: any): boolean {
    return button && 
           button.link && 
           typeof button.link === 'string' &&
           button.title && 
           typeof button.title === 'string' &&
           this.isValidUrl(button.link);
  }

  getButtonTitle(button: any): string {
    return button.title || 'Click Here';
  }

  getButtonLink(button: any): string {
    return button.link || '#';
  }

  isExternalLink(button: any): boolean {
    const link = this.getButtonLink(button);
    return link.startsWith('http://') || link.startsWith('https://');
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') || url.startsWith('#') || url.startsWith('?');
    }
  }
}
