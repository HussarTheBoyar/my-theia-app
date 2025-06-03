import { MessageService } from '@theia/core';
import { DialogProps, Message } from '@theia/core/lib/browser';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import * as React from 'react';

import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import { TriggerConfig } from './common/trigger-interface';
import { SecondStepDialog } from './step2-dialog';
import { SecondStepIcount } from './step2-icount';

@injectable()
export class FirstStepDialogProps extends DialogProps {}

interface DialogState {
  triggerName: string;
  triggerType: string;
}

interface DialogContentProps {
  state: DialogState;
  onTriggerNameChange: (value: string) => void;
  onTriggerTypeChange: (value: string) => void;
}

const DialogContent: React.FC<DialogContentProps> = ({ state, onTriggerNameChange, onTriggerTypeChange }) => {
  const triggerNameInputRef = React.useRef<HTMLInputElement>(null);

  // Log renders
  React.useEffect(() => {
    console.log('DialogContent rendered', state);
  }, [state]);

  // Restore focus after render
  React.useEffect(() => {
    const input = triggerNameInputRef.current;
    if (input && document.activeElement !== input) {
      setTimeout(() => {
        if (input && document.activeElement !== input) {
          input.focus();
          console.log('Focus restored to trigger-name');
        }
      }, 0);
    }
  }, [state.triggerName, state.triggerType]);

  // Monitor DOM changes
  React.useEffect(() => {
    const input = triggerNameInputRef.current;
    if (input) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          console.log('DOM mutation detected:', mutation);
        });
      });
      observer.observe(input.parentElement!, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []);

  const FormGrid = styled(Grid)(() => ({
    display: 'flex',
    flexDirection: 'column',
  }));

  const commonSelectStyle = {
    '& .MuiInputBase-root': {
      height: 40,
    },
    backgroundColor: '#41414C',
    color: '#ffffff',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'none' },
    '& .MuiSelect-icon': { color: '#ffffff' },
  };

  const commonMenuProps = {
    PaperProps: {
      sx: {
        backgroundColor: '#2c2c34',
        color: '#ffffff',
        '& .MuiMenuItem-root': {
          '&.Mui-selected': {
            backgroundColor: '#3a3a45',
          },
          '&:hover': {
            backgroundColor: '#50505f',
          },
        },
      },
    },
  };

  return (
    <div
      className="xplor-ide-dialog xplor-ide-grid-container"
      style={{ paddingLeft: '20px', backgroundColor: 'none', color: '#ffffff' }}
      id="xplor-ide-create-project-dialog"
    >
      <Grid container spacing={3} flexDirection={'column'}>
        <Grid item xs={12} sx={{ mt: 1, padding: 0 }}>
          <FormGrid>
            <FormLabel
              htmlFor="trigger-name"
              className="title-form"
              sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
            >
              Trigger name <span style={{ color: 'red' }}>*</span>
            </FormLabel>
            <FormControl fullWidth>
              <TextField
                inputRef={triggerNameInputRef}
                id="trigger-name"
                value={state.triggerName}
                onChange={(e) => onTriggerNameChange(e.target.value)}
                onBlur={() => console.log('Trigger name lost focus')}
                placeholder="Enter trigger name"
                required
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiInputBase-root': {
                    height: 40,
                    backgroundColor: '#41414C',
                    color: '#ffffff',
                  },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'none' },
                }}
                onFocus={() => console.log('Trigger name gained focus')}
              />
            </FormControl>
          </FormGrid>
        </Grid>

        <Grid item xs={12} sx={{ mt: 1, padding: 0 }}>
          <FormGrid>
            <FormLabel
              htmlFor="trigger-type"
              className="title-form"
              sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
            >
              Trigger Type <span style={{ color: 'red' }}>*</span>
            </FormLabel>
            <FormControl fullWidth variant="outlined">
              <Select
                id="trigger-type"
                value={state.triggerType}
                onChange={(e) => onTriggerTypeChange(e.target.value as string)}
                sx={commonSelectStyle}
                MenuProps={commonMenuProps}
                displayEmpty
              >
                <MenuItem className="menu-item" value="">Select type</MenuItem>
                <MenuItem value="mcontrol">mcontrol</MenuItem>
                <MenuItem value="icount">icount</MenuItem>
                <MenuItem value="itrigger">itrigger</MenuItem>
                <MenuItem value="etrigger">etrigger</MenuItem>
              </Select>
            </FormControl>
          </FormGrid>
        </Grid>
      </Grid>
    </div>
  );
};

@injectable()
export class FirstStepDialog extends ReactDialog<TriggerConfig> {
    @inject(MessageService)
    protected readonly messageService: MessageService;

    @inject(SecondStepDialog)
    protected readonly secondStepDialog: SecondStepDialog;

    @inject(SecondStepIcount)
    protected readonly secondStepIcount: SecondStepIcount;

    private finalConfig?: TriggerConfig;
    private initialTriggerData?: TriggerConfig; // Lưu trữ node.triggerData

    private static persistedState: DialogState = {
        triggerName: '',
        triggerType: '',
    };

    private state: DialogState;

    constructor(
        @inject(DialogProps) protected readonly props: DialogProps
    ) {
        super(props);
        this.state = { ...FirstStepDialog.persistedState };
        this.appendCloseButton('Cancel');
        this.appendAcceptButton('Create');

        this.handleChange = this.handleChange.bind(this);
        this.handleTriggerNameChange = this.handleTriggerNameChange.bind(this);
    }

    get value(): TriggerConfig {
        return {
            ...this.initialTriggerData, // Bao gồm toàn bộ dữ liệu từ node.triggerData
            name: this.state.triggerName,
            triggerType: this.state.triggerType as 'mcontrol' | 'icount' | 'itrigger' | 'etrigger',
            id: this.initialTriggerData?.id || '',
            isEnable: this.initialTriggerData?.isEnable ?? true,
            tdata1: this.initialTriggerData?.tdata1 || ({} as any),
            tdata2: this.initialTriggerData?.tdata2,
        };
    }

    private setDialogState(partialState: Partial<DialogState>): void {
        const newState = { ...this.state, ...partialState };
        if (newState.triggerName !== this.state.triggerName || newState.triggerType !== this.state.triggerType) {
            this.state = newState;
            FirstStepDialog.persistedState = { ...this.state };
            this.update();
            console.log('State updated:', newState);
        }
    }

    protected handleChange(event: SelectChangeEvent): void {
        this.setDialogState({ triggerType: event.target.value as string });
    }

    private readonly handleTriggerNameChange = (value: string) => {
        this.setDialogState({ triggerName: value });
    }

    protected render(): React.ReactNode {
        const loaderLine = document.getElementById('loader-line') as HTMLInputElement;
        if (loaderLine) {
            loaderLine.classList.remove('xplor-ide-loader-line');
        }

        return (
            <DialogContent
                state={this.state}
                onTriggerNameChange={this.handleTriggerNameChange}
                onTriggerTypeChange={(value) => this.handleChange({ target: { value } } as SelectChangeEvent)}
            />
        );
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.update();
    }

    @postConstruct()
    protected init(): void {
        this.title.label = 'Create Trigger';
        this.state = { ...FirstStepDialog.persistedState };
        this.update();
    }

    public async openWithData(trigger: TriggerConfig, isEdit = true): Promise<TriggerConfig | undefined> {
        this.initialTriggerData = { ...trigger }; // Lưu trữ node.triggerData
        this.setDialogState({
            triggerName: trigger.name,
            triggerType: trigger.triggerType
        });
        this.title.label = isEdit ? 'Edit Trigger' : 'Create Trigger';
        this.clearAcceptButton();
        this.appendAcceptButton(isEdit ? 'Edit' : 'Create');
        this.update();

        return super.open();
    }

    protected override async accept(): Promise<void> {
        if (!this.state.triggerName) {
            this.messageService.error('Please enter a trigger name.');
            return;
        }

        if (!this.state.triggerType) {
            this.messageService.error('Please select a trigger type.');
            return;
        }

        let config: TriggerConfig | undefined;

        if (this.state.triggerType === 'mcontrol') {
            config = await this.secondStepDialog.openWithData(this.value, this.title.label === 'Edit Trigger');
        } else if (this.state.triggerType === 'icount') {
            config = await this.secondStepIcount.openWithData(this.value, this.title.label === 'Edit Trigger');
        } else {
            this.messageService.error(`Trigger type "${this.state.triggerType}" is not supported yet.`);
            return;
        }

        if (config) {
            this.finalConfig = {
                ...config,
                name: this.state.triggerName,
                triggerType: this.state.triggerType as 'mcontrol' | 'icount' | 'itrigger' | 'etrigger',
            };
            console.log('Final Trigger Config:', this.finalConfig);
            super.accept();
        }
    }

    public override close(): void {
        super.close();
    }

    private clearAcceptButton(): void {
        const buttons = this['acceptButton'] ? [this['acceptButton']] : [];
        buttons.forEach(button => button.remove());
        this['acceptButton'] = undefined;
    }
}