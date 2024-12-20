import React from 'react';

function ShowInfo({ title, subtitle, labels = [], values = [] }) {
    return (
        <div>
            <h1 className="user__info__title">{title}</h1>
            <h2>{subtitle}</h2>
            <div className="user__info">
                <ul className="user__info__list">
                    {labels.map((label, index) => (
                        <li key={index} className="user__info__list__item">{label}</li>
                    ))}
                </ul>

                <ul className="user__info__list">
                    {Array.isArray(values) && values.map((value, index) => (
                        <li key={index} className="user__info__list__item">{value}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}


export default ShowInfo;
