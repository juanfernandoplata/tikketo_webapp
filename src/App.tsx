import React from "react"
import { useState, useEffect } from "react"
import styled from "styled-components"
import axios from "axios"

import plusIcon from "./assets/plus.svg"
import minusIcon from "./assets/minus.svg"

enum Selectors {
    MOVIE = 1,
    DATE = 2,
    TIME = 3,
    TICKETS = 4
}

interface EventInfo {
    eventId: number,
    eventDate: string,
    eventTime: string,
    eventCaracts: any
}

function App() {
    // BORRAR EN PRODUCCION
    const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiQlVTSU5FU1MiLCJjb21wSWQiOjEsInVzZXJSb2xlIjoiQURNSU4ifQ.wBhhvBsgdWQR2TaoK8mtyIQalLfH_OqMo8qFtEtxKZM"

    const [ events, setEvents ] = useState<Array<EventInfo>>( [] )

    const [ movies, setMovies ] = useState<Array<string>>( [ "-" ] )
    const [ dates, setDates ] = useState<Array<string>>( [ "-" ] )
    const [ times, setTimes ] = useState<Array<string>>( [ "-" ] )
    const [ avail, setAvail ] = useState<number>( 0 )

    const [ selMovie, setSelMovie ] = useState<number>( 0 )
    const [ selDate, setSelDate ] = useState<number>( 0 )
    const [ selTime, setSelTime ] = useState<number>( 0 )

    const [ eventId, setEventId ] = useState<number>( -1 )

    const [ selTickets, setSelTickets ] = useState<number>( 0 )

    const [ displayClientIdConf, setDisplayClientIdConf ] = useState<boolean>( false )
    const [ clientId, setClientId ] = useState<string>( "" )

    const [ reservId, setReservId ] = useState<number>( -1 )

    const [ displayClientPhoneConf, setDisplayClientPhoneConf ] = useState<boolean>( false )
    const [ clientPhone, setClientPhone ] = useState<string>( "" )

    useEffect(
        () => {
            axios.get( `http://127.0.0.1:8000/business/venues/${1}/events/${"movie"}/offering?accessToken=${accessToken}` )
            .then( ( res ) => {
                setEvents( () => ( res.data.events ) )

                let mvs : Array<string> = []
                for( let i = 0; i < res.data.events.length; i++ ){
                    let event : EventInfo = res.data.events[ i ]
                    if( !mvs.includes( event.eventCaracts.movie_name ) ){
                        mvs.push( event.eventCaracts.movie_name )
                    }
                }

                setMovies( [ "-" ].concat( mvs ) )
            })
        },
        []
    )

    const handleSelection = (
        selector : Number,
        e : React.ChangeEvent<HTMLSelectElement>
    ) => {
        switch( selector ){
            case( Selectors.MOVIE ):
                setSelMovie( () => ( e.target.selectedIndex ) )

                if( e.target.selectedIndex !== 0 ){
                    let dts : Array<string> = []
                    for( let i = 0; i < events.length; i++ ){
                        let event : EventInfo = events[ i ]
                        if( event.eventCaracts.movie_name === movies[ e.target.selectedIndex ] ){
                            dts.push( event.eventDate )
                        }
                    }

                    setDates( [ "-" ].concat( dts ) )
                    setSelDate( 0 )
                }
                else{
                    setDates( [ "-" ] )
                    setSelDate( 0 )
                }

                setTimes( [ "-" ] )
                setSelTime( 0 )

                setEventId( -1 )

                setAvail( 0 )
                setSelTickets( 0 )

                break

            case( Selectors.DATE ):
                setSelDate( e.target.selectedIndex )

                if( e.target.selectedIndex !== 0 ){
                    let tms : Array<string> = []
                    for( let i = 0; i < events.length; i++ ){
                        let event : EventInfo = events[ i ]
                        if( event.eventCaracts.movie_name === movies[ selMovie ] ){
                            tms.push( event.eventTime )
                        }
                    }

                    setTimes( [ "-" ].concat( tms ) )
                    setSelTime( 0 )
                }
                else{
                    setTimes( [ "-" ] )
                    setSelTime( 0 )
                }

                setEventId( -1 )

                setAvail( 0 )
                setSelTickets( 0 )

                break
                
            case( Selectors.TIME ):
                setSelTime( e.target.selectedIndex )

                if( e.target.selectedIndex !== 0 ){
                    let eventId : number = -1
                    for( let i = 0; i < events.length; i++ ){
                        let event : EventInfo = events[ i ]
                        if( event.eventCaracts.movie_name === movies[ selMovie ] &&
                            event.eventDate === dates[ selDate ] &&
                            event.eventTime === times[ e.target.selectedIndex ]
                        ){
                            eventId = event.eventId
                            break
                        }
                    }

                    setEventId( eventId )

                    axios.get( `http://127.0.0.1:8000/business/events/${eventId}/availability?accessToken=${accessToken}` )
                    .then( ( res ) => {
                            setAvail( res.data.availability )
                            setSelTickets( 0 )
                        }
                    )
                }
                else{
                    setAvail( 0 )
                    setSelTickets( 0 )
                }

                break
        }
    }

    const handleAddTicket = () => {
        if( selTickets < avail ){
            setSelTickets( ( prev ) => {
                return( prev + 1 )
            })
        }
    }

    const handleRemoveTicket = () => {
        if( selTickets > 0 ){
            setSelTickets( ( prev ) => {
                return( prev - 1 )
            })
        }
    }

    const handleClientIdChange = ( event ) => {
        setClientId( event.target.value )
    }

    const handleGoBack = () => {
        setSelMovie( 0 )
        setSelDate( 0 )
        setSelTime( 0 )

        setAvail( 0 )
        
        setEventId( -1 )
        
        setSelTickets( 0 )
        
        setDisplayClientIdConf( false )
        setClientId( "" )
    }

    const handleClientIdConf = () => {
        axios.post(
            `http://127.0.0.1:8000/business/events/${eventId}/reserve?accessToken=${accessToken}`,
            { "eventId": eventId, "clientId": clientId, "numTickets": selTickets },
            { headers: { "Content-Type": "application/json" } }
        ).then( ( res ) => {
            if( res.status == 200 ){
                setReservId( res.data.reservId )

                setDisplayClientIdConf( false )
                setClientId( "" )

                setDisplayClientPhoneConf( true )
            }
        })
    }

    const handleClientPhoneChange = ( event ) => {
        setClientPhone( event.target.value )
    }

    const handleCancelReservation = () => {
        axios.post( `http://127.0.0.1:8000/business/reservations/${reservId}/cancel?accessToken=${accessToken}` )
        .then( ( res ) => {
            if( res.status == 200 ){
                setSelMovie( 0 )
                setSelDate( 0 )
                setSelTime( 0 )

                setAvail( 0 )
                
                setEventId( -1 )
                
                setSelTickets( 0 )
                
                setDisplayClientPhoneConf( false )
                setClientPhone( "" )
            }
        })
    }

    const handleConfirmReservation = () => {
        axios.post( `http://127.0.0.1:8000/business/reservations/${reservId}/confirm?accessToken=${accessToken}` )
        .then( ( res ) => {
            if( res.status == 200 ){
                setSelMovie( 0 )
                setSelDate( 0 )
                setSelTime( 0 )

                setAvail( 0 )
                
                setEventId( -1 )
                
                setSelTickets( 0 )
                
                setDisplayClientPhoneConf( false )
                setClientPhone( "" )
            }
        })
    }

    return(
        <>
            <Reservation>
                <PosterCont>
                    <Poster
                        src = "https://drive.google.com/thumbnail?id=1dXLl0RBUt4wxB22UybC8gNEKZWmCWoo5&sz=w1000"
                        referrerPolicy = "no-referrer"
                    />
                </PosterCont>
                <Form>
                    <div>
                        <FieldTitle>Película</FieldTitle>
                        <FieldSelect
                            value = { movies[ selMovie ] }
                            onChange = { ( event ) => { handleSelection( Selectors.MOVIE, event ) } }
                        >
                            { movies.map( ( movie, i ) => (
                                <option
                                    key = { i }
                                >
                                    { movie }
                                </option>
                            ))}
                        </FieldSelect>
                    </div>
                    <DateTimeRow>
                        <DateFieldCont>
                            <FieldTitle>Fecha</FieldTitle>
                            <FieldSelect
                                value = { dates[ selDate ] }
                                onChange = { ( event ) => { handleSelection( Selectors.DATE, event ) } }
                            >
                                { dates.map( ( date, i ) => (
                                    <option
                                        key = { i }
                                    >
                                        { date }
                                    </option>
                                ))}
                            </FieldSelect>
                        </DateFieldCont>
                        <TimeFieldCont>
                            <FieldTitle>Hora</FieldTitle>
                            <FieldSelect
                                value = { times[ selTime ] }
                                onChange = { ( event ) => { handleSelection( Selectors.TIME, event ) } }
                            >
                                { times.map( ( time, i ) => (
                                    <option
                                        key = { i }
                                    >
                                        { time }
                                    </option>
                                ))}
                            </FieldSelect>
                        </TimeFieldCont>
                    </DateTimeRow>
                    <div>
                        <FieldTitle>Número de entradas</FieldTitle>
                        <EntriesButtonCont>
                            <EntriesButton
                                onClick = { handleRemoveTicket }
                            >
                                <img
                                    style = {{ width: "20px" }}
                                    src = { minusIcon }
                                />
                            </EntriesButton>
                            <EntriesButtonText>{ selTickets.toString() + " Personas" }</EntriesButtonText>
                            <EntriesButton
                                onClick = { handleAddTicket }
                            >
                                <img
                                    style = {{ width: "20px" }}
                                    src = { plusIcon }
                                />
                            </EntriesButton>
                        </EntriesButtonCont>
                    </div>
                    <ReserveButton
                        display = { selTickets !== 0 }
                        onClick = { () => { setDisplayClientIdConf( true ) } }
                    >
                        Reservar
                    </ReserveButton>
                </Form>
            </Reservation>

            <ScreenFader display = { displayClientIdConf || displayClientPhoneConf }/>

            <Confirmation
                display = { displayClientIdConf }
                style = {{ height: "320px" }}
            >
                <ConfLabel htmlFor = "clientId">
                    Ingresa aquí el número de cédula de la persona que hace la reserva:
                </ConfLabel>
                <ConfInput
                    type = "text"
                    id = "clientId"
                    name = "clientId"
                    value = { clientId }

                    onChange = { ( event ) => { handleClientIdChange( event ) } }
                />
                <div>
                    <ConfirmButton
                        onClick = { handleClientIdConf }
                    >
                        Confirmar
                    </ConfirmButton>
                    <CancelButton
                        onClick = { handleGoBack }
                    >
                        Regresar
                    </CancelButton>
                </div>
            </Confirmation>

            <Confirmation display = { displayClientPhoneConf }>
                <FieldTitle>
                    Se ha realizado un reserva temporal con éxito. { `Tienes ${ "2:00" } minutos para confirmarla...` }
                </FieldTitle>
                <ConfLabel htmlFor = "phone">
                    Ingresa aquí el número de celular donde se recibirán las boletas:
                </ConfLabel>
                <ConfInput
                    type = "tel"
                    id = "phone"
                    name = "phone"
                    value = { clientPhone }

                    onChange = { ( event ) => { handleClientPhoneChange( event ) } }
                />
                <div>
                    <ConfirmButton
                        onClick = { handleConfirmReservation }
                    >
                        Confirmar
                    </ConfirmButton>
                    <CancelButton
                        onClick = { handleCancelReservation }
                    >
                        Cancelar
                    </CancelButton>
                </div>
            </Confirmation>
        </>
    )
}

const Reservation = styled.div`
    box-sizing: border-box;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 1000px;
    height: 450px;

    padding: 30px 0px;

    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
`

const PosterCont = styled.div`
    box-sizing: border-box;

    width: 350px;
    height: 100%;
`

const Poster = styled.img`
    box-sizing: border-box;

    height: 100%;

    display: block;
    margin: 0px auto;

    border-radius: 10px;
`

const Form = styled.div`
    width: 520px;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
`

const FieldTitle = styled.p`
    margin: 0;
    padding: 0;

    font-size: medium;
    font-weight: 700;
`

const DateTimeRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

const DateFieldCont = styled.div`
    width: 330px;
`

const TimeFieldCont = styled.div`
    width: 175px;
`

const FieldSelect = styled.select`
    width: 100%;

    margin: 0;
    padding: 15px 10px;

    appearance: none;
    background-color: #FEFEFE;

    border: none;
    border: 2px solid #022D00;
    border-radius: 5px;

    font-size: x-large;
    font-weight: 700;

    &:hover{
        transition: border-color 0.75s;
        border-color: #022D00;
        border-radius: 5px;
    }
`

const EntriesButtonCont = styled.div`
    width: 60%;
    height: 50px;

    margin: 0px 0px;
    margin-top: 15px;

    padding: 0px 15px;

    background-color: #467E63;
    border-radius: 30px;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

const EntriesButton = styled.button`
    margin: 0;
    padding: 0;

    background-color: rgba(0, 0, 0, 0);
    border: none;

    &:hover{
        cursor: pointer;
    }
`

const EntriesButtonText = styled.p`
    margin: 0;
    margin-top: 0px;
    padding: 0;

    font-size: xx-large;
    font-weight: 500;
    color: white;
`

const ReserveButton = styled.button`
    width: 100%;

    margin: 0px 0px;
    padding: 15px 0px;

    background-color: #022D00;
    border: none;
    border-radius: 40px;

    font-size: xx-large;
    font-weight: 600;
    color: white;

    &:hover{
        cursor: pointer;
    }

    opacity: ${ props => props.display ? "1" : "0" };
    pointer-events: ${ props => props.display ? "auto" : "none" };

    transition: opacity 0.5s;
`

const ScreenFader = styled.div`
    position: absolute;
    top: 0%;
    left: 0%;

    width: 100%;
    height: 100%;

    background: white;

    opacity: ${ props => props.display ? "0.9" : "0" };
    pointer-events: ${ props => props.display ? "auto" : "none" };

    transition: opacity 0.5s;
`

const Confirmation = styled.div`
    box-sizing: border-box;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 410px;
    height: 380px;

    padding: 25px 25px;

    background-color: #F2FEFE;
    border: 2px solid #022D00;
    border-radius: 25px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    opacity: ${ props => props.display ? "1" : "0" };
    pointer-events: ${ props => props.display ? "auto" : "none" };

    transition: opacity 0.5s;
`

const ConfLabel = styled.label`
    font-size: medium;
    font-weight: 700;
`

const ConfInput = styled.input`
    width: 65%;

    margin: 0 auto;
    padding: 15px 10px;

    appearance: none;
    background-color: #FEFEFE;

    border: none;
    border: 2px solid #022D00;
    border-radius: 5px;

    font-size: x-large;
    font-weight: 700;

    text-align: center;

    &:focus{
        outline: none;
    }
`

const ConfirmButton = styled.button`
    width: 100%;

    margin: 0px 0px;
    padding: 15px 0px;

    background-color: #022D00;
    border: none;
    border-radius: 40px;

    font-size: x-large;
    font-weight: 600;
    color: white;

    &:hover{
        cursor: pointer;
    }
`

const CancelButton = styled.button`
    width: 50%;

    display: block;

    margin: 0px auto;
    margin-top: 10px;

    padding: 15px 0px;

    background-color: #7a0707;
    border: none;
    border-radius: 40px;

    font-size: medium;
    font-weight: 600;
    color: white;

    &:hover{
        cursor: pointer;
    }
`

export default App