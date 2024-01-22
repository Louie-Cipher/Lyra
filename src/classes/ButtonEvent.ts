import { ButtonEventType } from 'types/ButtonEvent';

export class ButtonEvent {
	constructor(buttonEventOptions: ButtonEventType) {
		Object.assign(this, buttonEventOptions);
	}
}
