import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Collapse, DropdownItem, DropdownMenu, DropdownToggle, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, UncontrolledDropdown,} from "reactstrap";
import {A, navigate, usePath} from "hookrouter";
import {t} from "client/components/Translator";

export default function TopMenu(props) {
    const [menuPulled, pullMenu] = useState(false);
    const currentPath = usePath();

    function isActive(path) {
        return path === currentPath;
    }

    return (
        <Navbar color="dark" dark expand="md">
            <NavbarBrand href='#' onClick={e => navigate('/')} className='mr-auto'>
                {t('Home purchases')}
            </NavbarBrand>
            <NavbarToggler onClick={e => pullMenu(!menuPulled)}/>
            <Collapse isOpen={menuPulled} navbar>
                <Nav className="ml-auto" navbar>
                    {props.items.map((item, i) => {
                        if(item.hidden) return <span key={i}></span>;
                        return item.items ? <UncontrolledDropdown nav inNavbar key={i}>
                                <DropdownToggle nav caret>
                                    {item.label}
                                </DropdownToggle>
                                <DropdownMenu>
                                    {item.items.map((itemSub, i) => {
                                        const ps = itemSub.path ? {href: itemSub.path} : itemSub.onClick ? {href: '#', onClick: itemSub.onClick} : {href: '#'}
                                        return <DropdownItem key={i}>
                                            <A {...ps}>{itemSub.label}</A>
                                        </DropdownItem>
                                    })}
                                </DropdownMenu>
                            </UncontrolledDropdown>
                            :
                            <NavItem key={i} active={isActive(item.path)}>
                                <A href={item.path || '#'} onClick={item.onClick} className={'nav-link'}>{item.label}</A>
                            </NavItem>
                    })}


                    {/*<UncontrolledDropdown nav inNavbar>
                            <DropdownToggle nav caret>
                                {t('Language')}
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={() => langSwitch('ru')}>
                                    RU
                                </DropdownItem>
                                <DropdownItem onClick={() => langSwitch('en')}>
                                    EN
                                </DropdownItem>

                            </DropdownMenu>
                        </UncontrolledDropdown>*/}

                </Nav>
            </Collapse>
        </Navbar>
    );

}

TopMenu.propTypes = {
    items: PropTypes.array.isRequired,
    title: PropTypes.string
};
