import React, { useState, useEffect } from 'react';

function ShowEditInfo({ title, subtitle, labels = [], values = {}, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedValues, setEditedValues] = useState({});

    useEffect(() => {
        setEditedValues(values);
    }, [values]); // `values` у залежностях

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        onSave(editedValues);
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        setEditedValues(values);
        setIsEditing(false);
    };

    const handleInputChange = (label, newValue) => {
        setEditedValues((prevValues) => ({
            ...prevValues,
            [label]: newValue,
        }));
    };

    return (
        <div>
            <h1 className="user__info__title">{title}</h1>
            <h2>{subtitle}</h2>
            <div className="user__info">
                <ul className="user__info__list">
                    {labels.map((label, index) => (
                        <li key={index} className="user__info__list__item">
                            {label}
                        </li>
                    ))}
                </ul>

                <ul className="user__info__list">
                    {labels.map((label, index) => (
                        <li key={index} className="user__info__list__item">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedValues[label] || ''}
                                    onChange={(e) => handleInputChange(label, e.target.value)}
                                    className="user__info__input"
                                />
                            ) : (
                                editedValues[label] || ''
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {isEditing ? (
                <div className="edit__block">
                    <button className="edit__btn" onClick={handleSaveClick}>Зберегти</button>
                    <button className="edit__btn" onClick={handleCancelClick}>Скасувати</button>
                </div>
            ) : (
                <div className="edit__block">
                    <button className="edit__btn" onClick={handleEditClick}>Редагувати</button>
                </div>
            )}
        </div>
    );
}

export default ShowEditInfo;
