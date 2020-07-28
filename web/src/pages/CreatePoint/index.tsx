import React, { useEffect, useState, ChangeEvent } from "react";
import "./styles.css";
import logo from "../../assets/logo.svg";
import { Link } from "react-router-dom"
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer,Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet"
import api from "../../services/api";
import axios from "axios";

interface Item {
    id: string,
    title: string,
    image_url: string
}

interface UF {
    sigla: string
}

interface Cidade {
    nome: string
}


const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState("0");
    const [cidades, setCidades] = useState<string[]>([]);
    const [selectLocalizacao, setSelectLocalizacao] = useState<[number,number]>([0,0]);
    const [selectPosicaoInicial, setSelectPosicaoInicial] = useState<[number,number]>([0,0]);

    useEffect(() => {
        api.get("items").then(response => {
            setItems(response.data);
        })
    }, [])

    useEffect(() => {
        axios.get<UF[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados/")
            .then(response => {
                const siglas = response.data.map(uf => uf.sigla);
                setUfs(siglas);
            })
    }, [])

    useEffect(() => {
        if (selectedUf === "0") {
            return
        }
        axios.get<Cidade[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cidade = response.data.map(cidade => cidade.nome);
                setCidades(cidade);
            })
    }, [selectedUf])

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectLocalizacao([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function HandleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function HandleSelectCidade(event: ChangeEvent<HTMLSelectElement>) {
        const cidade = event.target.value;
        setSelectedUf(cidade);
    }


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="logo" />
                <Link to="/">
                    <FiArrowLeft />Voltar para home
                </Link>
            </header>
            <form>
                <h1>Cadastro do ponto de coleta</h1>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name" className="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name" />
                    </div>
                    <div className="field">
                        <label htmlFor="email" className="name">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email" />
                    </div>
                    <div className="field">
                        <label htmlFor="whatsapp" className="whatsapp">Whatsapp</label>
                        <input
                            type="text"
                            name="whatsapp"
                            id="whatsapp" />
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o Endereço no mapa</span>
                    </legend>
                    <Map center={[-23.556365,-46.4625029]} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectLocalizacao}/>
                    </Map>
                    <div className="fieldgroup">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                value={selectedUf}
                                id="uf"
                                onChange={HandleSelectUf}
                            >
                                <option value="0">Selecione o estado</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                name="city"
                                value={cidades}
                                id="city"
                                onChange={HandleSelectCidade}
                            >
                                {cidades.map(cidade => (
                                    <option key={cidade} value={cidade}>{cidade}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Items de coleta</h2>
                        <span>Selecione um ou mais Items abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {
                            items.map(item => (
                                <li key={item.id}>
                                    <img src={item.image_url} alt={item.title} />
                                    <span>{item.title}</span>
                                </li>
                            ))
                        }

                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint;