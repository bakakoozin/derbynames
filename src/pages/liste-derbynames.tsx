import { Search } from "../components/search";

export function ListeDerbynames() {

    return (
        <div>
            <div className="flex flex-col items-center">
                <div className="pt-5">
                    <Search />
                </div>
                <h1 className="opacity-70 pt-5">LISTE DES <span className="font-bold">DERBY NAMES</span></h1>
            </div>
        </div>
    );
}