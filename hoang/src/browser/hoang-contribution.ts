import { Container, inject, injectable, interfaces } from '@theia/core/shared/inversify';
import { MenuModelRegistry } from '@theia/core';
import { HoangWidget } from './hoang-widget';
import { AbstractViewContribution, codicon, createTreeContainer, defaultTreeProps, TreeProps } from '@theia/core/lib/browser';
import { Command, CommandRegistry } from '@theia/core/lib/common/command';
import { FirstStepDialog } from './step1-dialog';
import { TabBarToolbarContribution, TabBarToolbarRegistry } from '@theia/core/lib/browser/shell/tab-bar-toolbar';

export const HoangCommand: Command = { id: 'hoang:command' };

export namespace TriggerCommand {
    export const IMPORT: Command = {
        id: 'trigger:import',
        label: 'Import Trigger'
    }
}

@injectable()
export class HoangContribution extends AbstractViewContribution<HoangWidget> implements TabBarToolbarContribution {

    @inject(FirstStepDialog)
    protected readonly demoDialog: FirstStepDialog;

    /**
     * `AbstractViewContribution` handles the creation and registering
     *  of the widget including commands, menus, and keybindings.
     * 
     * We can pass `defaultWidgetOptions` which define widget properties such as 
     * its location `area` (`main`, `left`, `right`, `bottom`), `mode`, and `ref`.
     * 
     */
    constructor() {
        super({
            widgetId: HoangWidget.ID,
            widgetName: HoangWidget.LABEL,
            defaultWidgetOptions: { area: 'left' },
            toggleCommandId: HoangCommand.id
        });
    }

    /**
     * Example command registration to open the widget from the menu, and quick-open.
     * For a simpler use case, it is possible to simply call:
     ```ts
        super.registerCommands(commands)
     ```
     *
     * For more flexibility, we can pass `OpenViewArguments` which define 
     * options on how to handle opening the widget:
     * 
     ```ts
        toggle?: boolean
        activate?: boolean;
        reveal?: boolean;
     ```
     *
     * @param commands
     */
    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(HoangCommand, {
            execute: () => super.openView({ activate: false, reveal: true })
        });

        commands.registerCommand(TriggerCommand.IMPORT, {
            execute: async () => {
                // Implement the import logic here
                await this.demoDialog.open();
            }
        });
    }

    /**
     * Example menu registration to contribute a menu item used to open the widget.
     * Default location when extending the `AbstractViewContribution` is the `View` main-menu item.
     * 
     * We can however define new menu path locations in the following way:
     ```ts
        menus.registerMenuAction(CommonMenus.HELP, {
            commandId: 'id',
            label: 'label'
        });
     ```
     * 
     * @param menus
     */
    registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
    }

    registerToolbarItems(toolbar: TabBarToolbarRegistry): void {
        toolbar.registerItem({
            id: TriggerCommand.IMPORT.id,
            command: TriggerCommand.IMPORT.id,
            icon: codicon('settings'),
            priority: 2,
            tooltip: TriggerCommand.IMPORT.label,
        });
    }
}

export const TRIGGER_PROPS = <TreeProps>{
    ...defaultTreeProps,
    globalSelection: true,
};

export function createRISCVDebugTriggerTreeContainer(parent: interfaces.Container): Container {
    const child = createTreeContainer(parent, {
        widget: HoangWidget,
        props: TRIGGER_PROPS,
    });

    // Ensure no duplicate bindings
    if (child.isBound(HoangWidget)) {
        child.unbind(HoangWidget);
    }
    child.bind(HoangWidget).toSelf();

    return child;
}

export function createRISCVTriggerWidget(parent: interfaces.Container): HoangWidget {
    return createRISCVDebugTriggerTreeContainer(parent).get(HoangWidget);
}


