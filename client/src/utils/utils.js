import { Divider } from 'primereact/divider';

export const passwordHeader = <div className="font-bold mb-3">Escolha uma senha</div>;

export const passwordFooter = (
    <>
        <Divider />
        <p className="mt-2">Regras</p>
        <ul className="pl-2 ml-2 mt-0 line-height-3">
            <li>Pelo menos uma letra minúscula</li>
            <li>Pelo menos uma letra maiúscula</li>
            <li>Pelo menos um número</li>
            <li>Mínimo 8 caracteres</li>
        </ul>
    </>
);

export const toDay = new Date();

export const toDayPlus90 = new Date( Date.now() + 90 * 24 * 60 * 60 * 1000);
