import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the tablist with two tabs', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const tablist = host.querySelector('[role="tablist"]');
    const tabs = host.querySelectorAll('[role="tab"]');
    expect(tablist).not.toBeNull();
    expect(tabs.length).toBe(2);
    expect(tabs[0].textContent?.trim()).toBe('Lista GIFs');
    expect(tabs[1].textContent?.trim()).toBe('Preferiti');
  });
});
