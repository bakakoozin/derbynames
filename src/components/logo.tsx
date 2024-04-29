import { useState } from 'react';

export function Logo() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div>
            <img
                className={`size-28 shadow-md ${isHovered ? 'shadow-400' : 'shadow-500'}`}
                src={isHovered ? '/derbynames_logo_grey_inv.png' : '/derbynames_logo_grey.png'}
                alt={isHovered ? 'logo derbynames couleurs inversées' : 'logo derbynames'}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
        </div>
    );
}