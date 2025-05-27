import { ContainerModule } from '@theia/core/shared/inversify';
import { HoangWidget } from './hoang-widget';
import { createRISCVTriggerWidget, HoangContribution } from './hoang-contribution';
import { bindViewContribution, DialogProps, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';

import '../../src/browser/style/index.css';
import { TabBarToolbarContribution } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { SecondStepDialog, SecondStepDialogProps } from './step2-dialog';
import { FirstStepDialog, FirstStepDialogProps } from './step1-dialog';
import { SecondStepIcount, SecondStepIcountProps } from './step2-icount';

export default new ContainerModule(bind => {
    bindViewContribution(bind, HoangContribution);
    bind(FrontendApplicationContribution).toService(HoangContribution);
    bind(HoangWidget).toDynamicValue(ctx =>
        createRISCVTriggerWidget(ctx.container)
    );
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: HoangWidget.ID,
        createWidget: () => ctx.container.get<HoangWidget>(HoangWidget)
    })).inSingletonScope();
    bind(FirstStepDialog).toSelf().inSingletonScope();
    bind(SecondStepDialog).toSelf().inSingletonScope();
    bind(SecondStepIcount).toSelf().inSingletonScope();

    bind(DialogProps).toConstantValue({ title: 'Add New Trigger' });
    
    bind(FirstStepDialogProps).toConstantValue({ title: 'Create Project' });
    bind(SecondStepDialogProps).toConstantValue({ title: 'Create Project' });
    bind(SecondStepIcountProps).toConstantValue({ title: 'Create Project' });


    for (const identifier of [TabBarToolbarContribution]) {
        bind(identifier).toService(HoangContribution);
    }
});
