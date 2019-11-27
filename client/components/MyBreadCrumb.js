import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {A} from "hookrouter";
import {t} from "client/components/Translator";
import React from "react";

export default function MyBreadCrumb(props) {
    return <Breadcrumb>
        <BreadcrumbItem key={'home'}><A href="/">{t('Home')}</A></BreadcrumbItem>
        {props.items.map((item,i)=><BreadcrumbItem key={i}>{item.href ? <A href={item.href}>{item.label}</A>: item.label}</BreadcrumbItem>)}
    </Breadcrumb>
}
