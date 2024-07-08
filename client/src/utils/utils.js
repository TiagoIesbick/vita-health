import { Divider } from 'primereact/divider';

export const passwordHeader = <div className="font-bold mb-3">Pick a password</div>;

export const passwordFooter = (
    <>
        <Divider />
        <p className="mt-2">Rules</p>
        <ul className="pl-2 ml-2 mt-0 line-height-3">
            <li>At least one lowercase</li>
            <li>At least one uppercase</li>
            <li>At least one numeric</li>
            <li>Minimum 8 characters</li>
        </ul>
    </>
);

export const toDay = new Date();

export const toDayPlus90 = new Date( Date.now() + 90 * 24 * 60 * 60 * 1000);
