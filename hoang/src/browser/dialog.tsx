import { MessageService } from '@theia/core';
import { DialogProps, Message } from '@theia/core/lib/browser';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import * as React from 'react';

@injectable()
export class DemoDialogProps extends DialogProps {
}

@injectable()
export class DemoDialog extends ReactDialog<void> {


        @inject(MessageService)
        protected readonly messageService: MessageService;

        constructor(
                @inject(DialogProps) protected readonly props: DialogProps
        ) {
                super(props);
                this.appendAcceptButton('Create');
                this.appendCloseButton('Cancel');
        }

        get value(): void {
                return;
        }

        protected render(): React.ReactNode {

                const loaderLine = document.getElementById('loader-line') as HTMLInputElement;
                if (loaderLine) {
                        loaderLine.classList.remove('xplor-ide-loader-line');
                }
                return (
                        <div className="xplor-ide-dialog xplor-ide-grid-container" style={{ minWidth: '500px' }} id='xplor-ide-create-project-dialog'>
                                <div className="xplor-xplor-ide-form-row">
                                        <h2>Create a new project</h2>
                                </div>

                        </div>
                );
        }




        protected override onAfterAttach(msg: Message): void {
                super.onAfterAttach(msg);
                this.update();
        }

        @postConstruct()
        protected init(): void {
                this.title.label = 'Create a new project';
                this.update();
        }

        protected override async accept(): Promise<void> {
                this.messageService.info('Accepted');
                super.accept();
        }

}
