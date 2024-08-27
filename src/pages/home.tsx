import { Modal } from "../components/modal";


export function Home() {

    return (
        <div>
            <div className="flex flex-col">
                <h2>Présentation appli</h2>
            </div>
            <div>
                <Modal button={(onClick) => <div onClick={onClick} className="cursor-pointer">bouton</div>} >
                    {(onClose) => <div>
                        <p>voilà</p>
                        <button onClick={onClose}>Submit</button>
                    </div>}
                </Modal>
                <Modal button={(onClick) => <div onClick={onClick} className="cursor-pointer p-4 bg-300">Mon Profil</div>} >
                    {(onClose) => <div>
                        <p>Voici</p>
                        <button onClick={onClose}>Submit</button>
                    </div>}
                </Modal>
            </div>
        </div>
    );
}