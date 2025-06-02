import { Container, inject, injectable, interfaces } from '@theia/core/shared/inversify';
import { MenuModelRegistry } from '@theia/core';
import { HoangWidget } from './hoang-widget';
import {
    AbstractViewContribution,
    codicon,
    createTreeContainer,
    defaultTreeProps,
    TreeProps,
    Widget
} from '@theia/core/lib/browser';
import { Command, CommandRegistry } from '@theia/core/lib/common/command';
import { FirstStepDialog } from './step1-dialog';
import {
    TabBarToolbarContribution,
    TabBarToolbarRegistry
} from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { MessageService } from '@theia/core';

export const HoangCommand: Command = { id: 'hoang:command' };

export namespace TriggerCommand {
    export const IMPORT: Command = {
        id: 'trigger:import',
        label: 'Import Trigger'
    };
    export const DELETE_ALL: Command = {
        id: 'trigger:delete-all',
        label: 'Delete All Triggers'
    };
    export const DISABLE_ALL: Command = {
        id: 'trigger:disable-all',
        label: 'Disable/Enable All Triggers'
    };
    export const EDIT_TRIGGER: Command = {
        id: 'trigger:edit',
        label: 'Edit Trigger'
    };
    export const REMOVE_TRIGGER: Command = {
        id: 'trigger:remove',
        label: 'Remove Trigger'
    };
    export const REMOVE_ALL_TRIGGERS: Command = {
        id: 'trigger:remove-all',
        label: 'Remove All Triggers'
    };
    export const ACTIVE_ALL_TRIGGERS: Command = {
        id: 'trigger:active-all',
        label: 'Enable All Triggers'
    };
    export const INACTIVE_ALL_TRIGGERS: Command = {
        id: 'trigger:inactive-all',
        label: 'Disable All Triggers'
    };

    export function EDIT_TRIGGER_FN(): Command {
        return EDIT_TRIGGER;
    }
}

@injectable()
export class HoangContribution extends AbstractViewContribution<HoangWidget> implements TabBarToolbarContribution {

    @inject(FirstStepDialog)
    protected readonly firstDialog: FirstStepDialog;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    protected allDisabled = false;

    constructor() {
        super({
            widgetId: HoangWidget.ID,
            widgetName: HoangWidget.LABEL,
            defaultWidgetOptions: { area: 'left' },
            toggleCommandId: HoangCommand.id
        });
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(HoangCommand, {
            execute: () => super.openView({ activate: false, reveal: true })
        });

        commands.registerCommand(TriggerCommand.IMPORT, {
            execute: async () => {
                const valueTrigger = await this.firstDialog.open();
                if (valueTrigger) {
                    const widget = await this.openView({ activate: true });
                    if (widget instanceof HoangWidget) {
                        widget.triggers.push(valueTrigger);
                        await widget.refreshView();
                        this.firstDialog.close();
                        this.messageService.info(`Trigger "${valueTrigger.name}" imported.`);
                    }
                }
            },
            isEnabled: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger,
            isVisible: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger
        });

        commands.registerCommand(TriggerCommand.DELETE_ALL, {
            execute: async () => {
                const widget = await this.openView({ activate: true });
                if (widget instanceof HoangWidget) {
                    widget.triggers = [];
                    await widget.refreshView();
                    this.messageService.info('All triggers deleted.');
                }
            },
            isEnabled: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger,
            isVisible: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger
        });

        commands.registerCommand(TriggerCommand.DISABLE_ALL, {
            execute: async () => {
                const widget = await this.openView({ activate: true });
                if (widget instanceof HoangWidget) {
                    this.allDisabled = !this.allDisabled;
                    widget.triggers.forEach(trigger => trigger.isEnable = !this.allDisabled);
                    await widget.refreshView();
                    this.messageService.info(`All triggers ${this.allDisabled ? 'disabled' : 'enabled'}.`);
                }
            },
            isEnabled: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger,
            isVisible: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger
        });

        commands.registerCommand(TriggerCommand.EDIT_TRIGGER, {
            execute: async () => {
                const widget = await this.openView({ activate: true });
                if (widget instanceof HoangWidget) {
                    const selectedNode = widget.model.selectedNodes[0];
                    if (selectedNode && 'triggerData' in selectedNode) {
                        const triggerNode = selectedNode as any; // TriggerNode
                        const index = widget.triggers.findIndex(t => t.id === triggerNode.triggerData.id);
                        if (index === -1) {
                            this.messageService.warn(`Trigger "${triggerNode.name}" not found.`);
                            return;
                        }
                        const updatedTrigger = await this.firstDialog.openWithData(triggerNode.triggerData);
                        if (updatedTrigger) {
                            widget.triggers[index] = { ...widget.triggers[index], ...updatedTrigger };
                            await widget.refreshView();
                            this.messageService.info(`Trigger "${updatedTrigger.name}" updated.`);
                        }
                    } else {
                        this.messageService.warn('No trigger selected for editing.');
                    }
                }
            },
            isEnabled: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger,
            isVisible: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger
        });

        commands.registerCommand(TriggerCommand.REMOVE_TRIGGER, {
            execute: async () => {
                const widget = await this.openView({ activate: true });
                if (widget instanceof HoangWidget) {
                    const selectedNode = widget.model.selectedNodes[0];
                    if (selectedNode && 'triggerData' in selectedNode) {
                        const triggerNode = selectedNode as any; // TriggerNode
                        const index = widget.triggers.findIndex(t => t.id === triggerNode.triggerData.id);
                        if (index !== -1) {
                            const triggerName = widget.triggers[index].name;
                            widget.triggers.splice(index, 1);
                            await widget.refreshView();
                            this.messageService.info(`Trigger "${triggerName}" removed.`);
                        } else {
                            this.messageService.warn(`Trigger "${triggerNode.name}" not found.`);
                        }
                    } else {
                        this.messageService.warn('No trigger selected for removal.');
                    }
                }
            },
            isEnabled: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger,
            isVisible: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger
        });

        commands.registerCommand(TriggerCommand.REMOVE_ALL_TRIGGERS, {
            execute: async () => {
                const widget = await this.openView({ activate: true });
                if (widget instanceof HoangWidget) {
                    widget.triggers = [];
                    await widget.refreshView();
                    this.messageService.info('All triggers removed.');
                }
            },
            isEnabled: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger,
            isVisible: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger
        });

        commands.registerCommand(TriggerCommand.ACTIVE_ALL_TRIGGERS, {
            execute: async () => {
                const widget = await this.openView({ activate: true });
                if (widget instanceof HoangWidget) {
                    widget.triggers.forEach(trigger => trigger.isEnable = true);
                    await widget.refreshView();
                    this.messageService.info('All triggers activated.');
                }
            },
            isEnabled: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger,
            isVisible: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger
        });

        commands.registerCommand(TriggerCommand.INACTIVE_ALL_TRIGGERS, {
            execute: async () => {
                const widget = await this.openView({ activate: true });
                if (widget instanceof HoangWidget) {
                    widget.triggers.forEach(trigger => trigger.isEnable = false);
                    await widget.refreshView();
                    this.messageService.info('All triggers deactivated.');
                }
            },
            isEnabled: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger,
            isVisible: widget => widget instanceof Widget ? widget instanceof HoangWidget : !!this.trigger
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
        
        menus.registerSubmenu(HoangWidget.CONTEXT_MENU, 'Trigger Options');

        const registerMenuActions = (menuPath: string[], ...commands: Command[]) => {
            for (const [index, command] of commands.entries()) {
                const label = command.label;
                menus.registerMenuAction(menuPath, {
                    commandId: command.id,
                    label: label,
                    icon: command.iconClass,
                    order: String.fromCharCode('a'.charCodeAt(0) + index)
                });
            }
        };

        registerMenuActions(HoangWidget.CONTEXT_MENU,
            TriggerCommand.EDIT_TRIGGER,
            TriggerCommand.REMOVE_TRIGGER,
            TriggerCommand.REMOVE_ALL_TRIGGERS,
            TriggerCommand.ACTIVE_ALL_TRIGGERS,
            TriggerCommand.INACTIVE_ALL_TRIGGERS,
        );
    }

    registerToolbarItems(toolbar: TabBarToolbarRegistry): void {
        toolbar.registerItem({
            id: TriggerCommand.IMPORT.id,
            command: TriggerCommand.IMPORT.id,
            icon: codicon('add'),
            priority: 0,
            tooltip: TriggerCommand.IMPORT.label,
        });
        toolbar.registerItem({
            id: TriggerCommand.DISABLE_ALL.id,
            command: TriggerCommand.DISABLE_ALL.id,
            icon: codicon('activate-breakpoints'),
            priority: 1,
            tooltip: TriggerCommand.DISABLE_ALL.label,
        });
        toolbar.registerItem({
            id: TriggerCommand.DELETE_ALL.id,
            command: TriggerCommand.DELETE_ALL.id,
            icon: codicon('close-all'),
            priority: 2,
            tooltip: TriggerCommand.DELETE_ALL.label,
        });
    }

    get trigger(): HoangWidget | undefined {
        const { currentWidget } = this.shell;
        return currentWidget instanceof HoangWidget && currentWidget || undefined;
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

    if (child.isBound(HoangWidget)) {
        child.unbind(HoangWidget);
    }
    child.bind(HoangWidget).toSelf();

    return child;
}

export function createRISCVTriggerWidget(parent: interfaces.Container): HoangWidget {
    return createRISCVDebugTriggerTreeContainer(parent).get(HoangWidget);
}