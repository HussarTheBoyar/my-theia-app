import * as React from 'react';
import { injectable, postConstruct, inject } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';
import { Message } from '@theia/core/lib/browser';
import { DemoDialog } from './dialog';

@injectable()
export class HoangWidget extends ReactWidget {

    static readonly ID = 'hoang:widget';
    static readonly LABEL = 'Hoang Widget';

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    @inject(DemoDialog)
    protected readonly demoDialog!: DemoDialog;

    @postConstruct()
    protected init(): void {
        this.doInit()
    }

    protected async doInit(): Promise <void> {
        this.id = HoangWidget.ID;
        this.title.label = HoangWidget.LABEL;
        this.title.caption = HoangWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-window-maximize'; // example widget icon.
        this.update();
    }

    render(): React.ReactElement {
        return <div id='widget-container'>
            <button id='displayMessageButton' className='theia-button secondary' title='Display Message' onClick={async _a => await this.openDialog()}>Open Dialog</button>
        </div>
    }

    protected async openDialog(): Promise<void> {
        await this.demoDialog.open();
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        const htmlElement = document.getElementById('displayMessageButton');
        if (htmlElement) {
            htmlElement.focus();
        }
    }

}
