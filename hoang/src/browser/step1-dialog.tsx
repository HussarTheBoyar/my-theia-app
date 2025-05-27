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
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import { TriggerConfig } from './common/trigger-interface';
import { SecondStepDialog } from './step2-dialog';
import { SecondStepIcount } from './step2-icount';

@injectable()
export class FirstStepDialogProps extends DialogProps {}

interface DialogState {
  triggerName: string;
  triggerType: string;
}

@injectable()
export class FirstStepDialog extends ReactDialog<TriggerConfig> {
  @inject(MessageService)
  protected readonly messageService: MessageService;

  @inject(SecondStepDialog)
  protected readonly secondStepDialog: SecondStepDialog;

  @inject(SecondStepIcount)
  protected readonly secondStepIcount: SecondStepIcount;

  private finalConfig?: TriggerConfig;

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
    this.appendAcceptButton('Create');
    this.appendCloseButton('Cancel');

    this.handleChange = this.handleChange.bind(this);
    this.handleTriggerNameChange = this.handleTriggerNameChange.bind(this);
  }

  get value(): TriggerConfig {
    return this.finalConfig ?? {
      name: this.state.triggerName,
      id: '',
      isEnable: true,
      triggerType: this.state.triggerType as 'mcontrol' | 'icount' | 'itrigger' | 'etrigger',
      tdata1: {} as any,
      tdata2: undefined,
    };
  }

  protected handleChange(event: SelectChangeEvent): void {
    const newState = { ...this.state, triggerType: event.target.value as string };
    this.state = newState;
    FirstStepDialog.persistedState = { ...this.state };
    this.update();
  }

  private readonly handleTriggerNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTriggerName = event.target.value;
    this.state = { ...this.state, triggerName: newTriggerName };
    FirstStepDialog.persistedState = { ...this.state };
    this.update();
  }

  protected render(): React.ReactNode {
    const loaderLine = document.getElementById('loader-line') as HTMLInputElement;
    if (loaderLine) {
      loaderLine.classList.remove('xplor-ide-loader-line');
    }

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
        style={{ minWidth: '500px', padding: '28px', backgroundColor: 'none', color: '#ffffff' }}
        id="xplor-ide-create-project-dialog"
      >
        <Grid container spacing={3} flexDirection={'column'}>
          <Grid item xs={12} sx={{ mt: 1, padding: 0 }}>
            <FormControl fullWidth>
              <FormLabel
                htmlFor="trigger-name"
                className="title-form"
                required
                sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
              >
                Trigger name
              </FormLabel>
              <TextField
                id="trigger-name"
                fullWidth
                variant="outlined"
                value={this.state.triggerName}
                onChange={this.handleTriggerNameChange}
                placeholder="Enter trigger name"
                sx={{
                  '& .MuiInputBase-root': {
                    height: 40,
                    backgroundColor: '#41414C',
                    color: '#ffffff',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ffffff',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#ffffff',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#90caf9',
                  },
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
                required
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sx={{ mt: 1, padding: 0 }}>
            <FormGrid>
              <FormLabel
                htmlFor="trigger-type"
                className="title-form"
                required
                sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
              >
                Trigger Type
              </FormLabel>
              <FormControl fullWidth variant="outlined">
                <Select
                  id="trigger-type"
                  value={this.state.triggerType}
                  onChange={this.handleChange}
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
  }

  protected override onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.update();
  }

  @postConstruct()
  protected init(): void {
    this.title.label = 'Create a new project';
    this.state = { ...FirstStepDialog.persistedState };
    this.update();
  }

  public async openWithData(trigger: TriggerConfig, isEdit = true): Promise<TriggerConfig | undefined> {
    this.state = {
      triggerName: trigger.name,
      triggerType: trigger.triggerType
    };
    FirstStepDialog.persistedState = { ...this.state };
    this.title.label = isEdit ? 'Edit Trigger' : 'Create Trigger';
    this.update();

    return super.open();
  }

  protected override async accept(): Promise<void> {
    // Validate triggerName and triggerType
    if (!this.state.triggerName) {
      this.messageService.error('Please enter a trigger name.');
      return;
    }

    if (!this.state.triggerType) {
      this.messageService.error('Please select a trigger type.');
      return;
    }

    let config: TriggerConfig | undefined;

    // Open the appropriate second-step dialog based on triggerType
    if (this.state.triggerType === 'mcontrol') {
      config = await this.secondStepDialog.open();
    } else if (['icount', 'itrigger', 'etrigger'].includes(this.state.triggerType)) {
      config = await this.secondStepIcount.open();
    }

    if (config) {
      // Merge the second-step config with triggerName and triggerType
      this.finalConfig = {
        ...config,
        name: this.state.triggerName,
        triggerType: this.state.triggerType as 'mcontrol' | 'icount' | 'itrigger' | 'etrigger',
      };
      console.log('Final Trigger Config:', this.finalConfig);
      super.accept();
    }
    // If config is undefined (second-step dialog canceled), do not call super.accept()
  }

  public override close(): void {
    super.close();
  }
}