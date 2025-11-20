export default function OrderComponent(task, open){
    return(
        <div className="todo-card-result">
            <h1>{task.name}</h1>
            <p>{task.description}</p>
            <p>{task.schedule}</p>
            <p>{task.address}</p>
        </div>
    )
}
