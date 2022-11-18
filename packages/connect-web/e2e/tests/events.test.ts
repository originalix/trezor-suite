import { test, expect, Page } from '@playwright/test';
import { TrezorUserEnvLink } from '@trezor/trezor-user-env-link';

const openPopup = async (page: Page) => {
    await page.goto('http://127.0.0.1:8080');

    const [popup] = await Promise.all([
        // It is important to call waitForEvent before click to set up waiting.
        page.waitForEvent('popup'),
        // Opens popup.
        await page.click('button'),
    ]);
    await popup.waitForLoadState('load');
    return popup;
};

const allowPermissionsOnce = async (popup: Page) => {
    await popup.click('button.confirm >> visible=true');
};

const allowPermissionsForever = async (popup: Page) => {
    await popup.click("#container >> text=Don't ask me again");
    await popup.click('button.confirm >> visible=true');
};

const confirmGetAddressInPopup = async (popup: Page) => {
    await popup.click('button.confirm');
    await popup.waitForSelector('.check-address >> visible=true');
    await TrezorUserEnvLink.api.pressYes();
    await popup.waitForEvent('close');
};

const expectNumberOf = async (type: 'events' | 'calls', number: number, page: Page) => {
    expect(await page.locator(`.${type}`).count()).toEqual(number);
};

test.beforeAll(async () => {
    await TrezorUserEnvLink.connect();
    await TrezorUserEnvLink.api.startBridge();
});

test.beforeEach(async () => {
    await TrezorUserEnvLink.api.stopEmu();
    await TrezorUserEnvLink.api.startEmu({ wipe: true });
    await TrezorUserEnvLink.api.setupEmu({ needs_backup: false });
});

test.describe('events when using @trezor/connect-web with popup based on permissions', () => {
    test(`Permissions "allow once" do not allow device events`, async ({ page }) => {
        const popup = await openPopup(page);

        await allowPermissionsOnce(popup); // <--- difference
        await confirmGetAddressInPopup(popup);

        expectNumberOf('events', 0, page); // <--- difference
        expectNumberOf('calls', 1, page);
    });

    test(`Permissions allowed forever ( do not ask again) allow device events`, async ({
        page,
    }) => {
        const popup = await openPopup(page);

        await allowPermissionsForever(popup); // <--- difference
        await confirmGetAddressInPopup(popup);

        expectNumberOf('events', 3, page); // <--- difference
        expectNumberOf('calls', 1, page);

        await page.pause();
    });
});
