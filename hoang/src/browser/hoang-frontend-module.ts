import { ContainerModule } from '@theia/core/shared/inversify';
import { HoangWidget } from './hoang-widget';
import { HoangContribution } from './hoang-contribution';
import { bindViewContribution, DialogProps, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';

import '../../src/browser/style/index.css';
import { DemoDialog, DemoDialogProps } from './dialog';

export default new ContainerModule(bind => {
    bindViewContribution(bind, HoangContribution);
    bind(FrontendApplicationContribution).toService(HoangContribution);
    bind(HoangWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: HoangWidget.ID,
        createWidget: () => ctx.container.get<HoangWidget>(HoangWidget)
    })).inSingletonScope();

    bind(DemoDialog).toSelf().inSingletonScope();
    bind(DialogProps).toConstantValue({ title: 'Theia' });
    bind(DemoDialogProps).toConstantValue({ title: 'Create Project' });
});
